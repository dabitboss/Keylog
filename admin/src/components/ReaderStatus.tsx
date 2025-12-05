import React, { useEffect, useState } from 'react';
import { Api } from '../api/client';
import { useAuth } from '../auth';
import { Device } from '../types';
import { formatDistanceToNow } from 'date-fns';

export const ReaderStatus: React.FC = () => {
  const auth = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const data = await Api.listDevices(auth);
      setDevices(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    void load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [auth.apiBase, auth.token]);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Salud de lectores</p>
          <h2>Monitoreo en vivo</h2>
          <p className="muted">Última comunicación y estado aproximado de cada lector.</p>
        </div>
        <button className="ghost" type="button" onClick={load}>
          Actualizar
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="status-grid">
        {devices.map((device) => {
          const lastSeen = device.last_seen_at ? new Date(device.last_seen_at) : undefined;
          const statusLabel = lastSeen
            ? `Hace ${formatDistanceToNow(lastSeen, { addSuffix: false })}`
            : 'Sin comunicación';
          return (
            <article key={device.id} className="status-card">
              <header>
                <strong>{device.name}</strong>
                <span className={`pill ${device.secret_set ? 'ok' : 'warn'}`}>
                  {device.secret_set ? 'Seguro' : 'Sin secreto'}
                </span>
              </header>
              <p className="muted">Tipo: {device.type}</p>
              <p className="muted">Ubicación: {device.location || '—'}</p>
              <p className="status-line">{statusLabel}</p>
            </article>
          );
        })}
        {!devices.length && <p className="muted">No hay lectores registrados.</p>}
      </div>
    </section>
  );
};
