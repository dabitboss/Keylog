import React from 'react';
import { useAuth } from '../auth';

export const TopBar: React.FC = () => {
  const auth = useAuth();

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Configuración</p>
          <h2>Conexión y credenciales</h2>
          <p className="muted">Define la API base, WebSocket de eventos y el token JWT para las peticiones protegidas.</p>
        </div>
      </div>
      <div className="grid two-cols gap">
        <label className="field">
          <span>API Base</span>
          <input
            type="text"
            value={auth.apiBase}
            onChange={(e) => auth.setApiBase(e.target.value)}
            placeholder="http://localhost:3000/api"
          />
        </label>
        <label className="field">
          <span>WS Base</span>
          <input
            type="text"
            value={auth.wsBase}
            onChange={(e) => auth.setWsBase(e.target.value)}
            placeholder="ws://localhost:3000/ws/events"
          />
        </label>
        <label className="field full">
          <span>Token JWT</span>
          <input
            type="password"
            value={auth.token}
            onChange={(e) => auth.setToken(e.target.value)}
            placeholder="Bearer token"
          />
          <p className="muted">El token se almacena localmente para recargar la página sin perder la sesión.</p>
        </label>
      </div>
    </section>
  );
};
