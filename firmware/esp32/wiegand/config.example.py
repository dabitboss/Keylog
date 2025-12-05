# Copy this file to config.py and fill in your Wi-Fi and API credentials.
WIFI_SSID = "your-ssid"
WIFI_PASSWORD = "your-password"

API_BASE_URL = "https://your-keylog-api.example.com/api"
API_TOKEN = "bearer-access-token"
READER_ID = "door-1"
HMAC_SECRET = b"super-secret-key"

# Pins for Wiegand (ESP32 GPIO numbers)
D0_PIN = 4
D1_PIN = 5

# Acceptable bit lengths for your readers (26 and/or 34)
ALLOWED_LENGTHS = (26, 34)

# PEM-encoded root CA certificate string to validate HTTPS (optional).
# Leave as None to skip verification (not recommended).
CA_CERT = None
