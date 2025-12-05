# MicroPython firmware for ESP32 + Wiegand 26/34 reader
# - Connects to Wi-Fi
# - Listens to Wiegand D0/D1 lines
# - Sends card codes to Keylog API over HTTPS with HMAC-SHA256 signature

try:
    import urequests as requests
except ImportError:
    import requests  # type: ignore

import machine
import network
import time
import ubinascii
import ujson
import uhashlib

import config


def hmac_sha256(key: bytes, msg: bytes) -> str:
    """Minimal HMAC-SHA256 implementation for MicroPython."""
    block_size = 64
    if len(key) > block_size:
        key = uhashlib.sha256(key).digest()
    key = key.ljust(block_size, b"\x00")
    o_key_pad = bytes((b ^ 0x5C) for b in key)
    i_key_pad = bytes((b ^ 0x36) for b in key)
    inner = uhashlib.sha256(i_key_pad + msg).digest()
    return ubinascii.hexlify(uhashlib.sha256(o_key_pad + inner).digest()).decode()


class ApiClient:
    def __init__(self):
        self.base = config.API_BASE_URL.rstrip('/')
        self.token = config.API_TOKEN
        self.reader_id = config.READER_ID
        self.ca = config.CA_CERT

    def _headers(self, signature: str, timestamp_ms: int):
        return {
            "Authorization": f"Bearer {self.token}",
            "X-Reader-Id": self.reader_id,
            "X-Signature": signature,
            "X-Timestamp": str(timestamp_ms),
            "Content-Type": "application/json",
        }

    def send_wiegand(self, payload: dict):
        ts = payload.get("timestamp_ms", int(time.ticks_ms()))
        message = f"{payload['reader_id']}|{payload['bits']}|{payload['raw']}|{ts}".encode()
        signature = hmac_sha256(config.HMAC_SECRET, message)
        headers = self._headers(signature, ts)
        url = f"{self.base}/devices/wiegand"
        ssl_param = {"cert": self.ca} if self.ca else {}
        try:
            resp = requests.post(url, data=ujson.dumps(payload), headers=headers, **ssl_param)
            print("[API] status", resp.status_code, resp.text)
            resp.close()
        except Exception as exc:  # noqa: BLE001
            print("[API] error", exc)


def connect_wifi(ssid: str, password: str, retries: int = 20):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        wlan.connect(ssid, password)
        attempt = 0
        while not wlan.isconnected() and attempt < retries:
            attempt += 1
            print(f"[WiFi] connecting... {attempt}/{retries}")
            time.sleep(1)
    if wlan.isconnected():
        print("[WiFi] connected", wlan.ifconfig())
    else:
        print("[WiFi] failed to connect")
    return wlan


class WiegandReader:
    def __init__(self, d0_pin: int, d1_pin: int, allowed_lengths=(26, 34),
                 bit_timeout_ms: int = 50, on_code=None):
        self.d0 = machine.Pin(d0_pin, machine.Pin.IN, machine.Pin.PULL_UP)
        self.d1 = machine.Pin(d1_pin, machine.Pin.IN, machine.Pin.PULL_UP)
        self.allowed_lengths = allowed_lengths
        self.bit_timeout_ms = bit_timeout_ms
        self.on_code = on_code
        self.bits = []
        self.last_tick = time.ticks_ms()
        self.timer = machine.Timer(0)
        self.timer.init(period=self.bit_timeout_ms, mode=machine.Timer.PERIODIC, callback=self._check_timeout)
        self.d0.irq(trigger=machine.Pin.IRQ_FALLING, handler=self._handle_d0)
        self.d1.irq(trigger=machine.Pin.IRQ_FALLING, handler=self._handle_d1)
        print(f"[Wiegand] listening on D0={d0_pin}, D1={d1_pin}")

    def _handle_d0(self, pin):
        self.bits.append('0')
        self.last_tick = time.ticks_ms()

    def _handle_d1(self, pin):
        self.bits.append('1')
        self.last_tick = time.ticks_ms()

    def _check_timeout(self, timer):
        if not self.bits:
            return
        if time.ticks_diff(time.ticks_ms(), self.last_tick) > self.bit_timeout_ms:
            self._finalize()

    def _finalize(self):
        bit_len = len(self.bits)
        raw = ''.join(self.bits)
        if bit_len in self.allowed_lengths:
            try:
                value = int(raw, 2)
            except ValueError:
                value = -1
            print(f"[Wiegand] code len={bit_len} value={value}")
            if self.on_code:
                self.on_code(raw, bit_len, value)
        else:
            print(f"[Wiegand] ignored frame len={bit_len}")
        self.bits = []


def handle_code(raw: str, bits: int, value: int):
    payload = {
        "reader_id": config.READER_ID,
        "bits": bits,
        "raw": raw,
        "value": value,
        "timestamp_ms": int(time.ticks_ms()),
    }
    client.send_wiegand(payload)


if __name__ == "__main__":
    connect_wifi(config.WIFI_SSID, config.WIFI_PASSWORD)
    client = ApiClient()
    reader = WiegandReader(config.D0_PIN, config.D1_PIN, allowed_lengths=config.ALLOWED_LENGTHS, on_code=handle_code)
    while True:
        time.sleep(1)
