# Keylog

Arquitectura base para un sistema de control de accesos con backend Node.js/Express, base de datos PostgreSQL, módulo de roles y permisos, API REST documentada y panel de administración en React.

## Estructura de carpetas
- `backend/`: API Express con autenticación JWT (access + refresh), roles y permisos, CRUD de usuarios y control de dispositivos (RFID, Wiegand, ESP32) siguiendo un esquema MVC.
- `admin/`: Panel React (Vite) para operación y monitoreo.
- `firmware/`: Plantillas para microcontroladores y lectores (ESP32, RFID, Wiegand).
- `docs/`: Artefactos de documentación (OpenAPI, diagramas, RFCs).

## Backend
- **Framework**: Express + TypeScript.
- **Autenticación**: JWT de acceso + refresh tokens.
- **Roles y permisos**: Endpoints para alta y consulta de roles con permisos.
- **Usuarios**: CRUD protegido para administración.
- **Dispositivos**: Registro y actualización de dispositivos (RFID, Wiegand, ESP32).
- **Eventos**: Registro y consulta de eventos de entrada/salida.
- **Ingesta de dispositivos**: Endpoint protegido por firma HMAC (`POST /api/devices/wiegand`) que valida el lector, verifica timestamp y almacena el evento con su payload.
- **OpenAPI**: `docs/openapi.yaml` describe los endpoints iniciales.

### Uso rápido
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

## Panel `admin`
Proyecto React con Vite listo para operar el backend:

- **Usuarios**: vista de usuarios con rol, estado y fecha de alta.
- **Roles**: alta de roles y consulta rápida.
- **Dispositivos**: alta de lectores (RFID/Wiegand/ESP32) y actualización de sus secretos.
- **Monitoreo**: tarjetas de salud para lectores (último ping/estado) y feed de eventos en vivo por WebSocket con fallback a consulta REST.
- **Configuración**: formulario para definir API base, WebSocket de eventos y token JWT (persistido en `localStorage`).

### Uso rápido
```bash
cd admin
npm install
npm run dev
```

Variables útiles (Vite):

- `VITE_API_BASE` (default `http://localhost:3000/api`)
- `VITE_WS_BASE` (default `ws://localhost:3000/ws/events`)

## Firmware
Incluye lineamientos para organizar código de microcontroladores y ejemplos de integración con la API (HTTP/WebSocket).

## Base de datos
Configurable vía `DATABASE_URL` (PostgreSQL). La API usa `pg` con un `Pool` compartido.

### Esquema SQL
Consulta `docs/schema.sql` para crear las tablas base (`users`, `roles`, `permissions`, `devices`, `events`, `tokens`) junto con llaves foráneas, índices y triggers de auditoría y actualización de marcas de tiempo.

## Documentación
- `docs/openapi.yaml`: especificación inicial de la API Express.

## Próximos pasos sugeridos
- Añadir migraciones SQL para usuarios, roles, permisos, dispositivos y eventos.
- Implementar pruebas de integración para los endpoints protegidos.
- Añadir auditoría para cambios de configuración y sincronizar eventos con WebSockets.
