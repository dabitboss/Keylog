# Firmware
Ejemplos y plantillas para microcontroladores (ESP32, lectores RFID/Wiegand) que se comunicarán con la API Keylog.

## Estructura sugerida
- `esp32/` código para controladoras conectadas por Wi-Fi.
- `rfid/` plantillas para lectores RFID serial.
- `wiegand/` integración con controladores de puertas.

## ESP32 + Wiegand (MicroPython)
- Ruta: `firmware/esp32/wiegand/`
- Archivos:
  - `config.example.py`: copiar a `config.py` y completar credenciales Wi-Fi, URL de la API, token, identificador del lector, clave HMAC y pines D0/D1.
  - `main.py`: loop principal que escucha el lector Wiegand 26/34, conecta a Wi-Fi y envía el código leído a la API vía HTTPS firmada con HMAC-SHA256.
- Envío seguro:
  - Encabezados `X-Reader-Id`, `X-Signature`, `X-Timestamp` y `Authorization: Bearer <token>`.
  - La firma se calcula con HMAC-SHA256 sobre `reader|bits|raw|timestamp_ms` utilizando `HMAC_SECRET`.
  - Puede usarse un certificado raíz PEM en `CA_CERT` para validar TLS; si se deja `None`, la verificación se omite (solo para pruebas).
- Puesta en marcha:
  1. Copiar `config.example.py` a `config.py` y editar valores.
  2. Flashear MicroPython al ESP32.
  3. Subir `config.py` y `main.py` (por ejemplo, con `mpremote` o `ampy`).
  4. Reiniciar el dispositivo; al recibir un frame Wiegand válido (26 o 34 bits), enviará el código a `/api/devices/wiegand`.
