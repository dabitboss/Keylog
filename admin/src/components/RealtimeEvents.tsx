import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth';
import { EventLog } from '../types';
import { format } from 'date-fns';
import { Api } from '../api/client';

export const RealtimeEvents: React.FC = () => {
  const auth = useAuth();
  const [events, setEvents] = useState<EventLog[]>([]);
  const [connection, setConnection] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const [error, setError] = useState('');

  const wsUrl = useMemo(() => {
    const tokenParam = auth.token ? `?token=${encodeURIComponent(auth.token)}` : '';
    return `${auth.wsBase}${tokenParam}`;
  }, [auth.wsBase, auth.token]);

  useEffect(() => {
    setConnection('connecting');
    setError('');
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setConnection('open');
    ws.onerror = () => setError('No se pudo conectar al WebSocket');
    ws.onclose = () => setConnection('closed');
    ws.onmessage = (message) => {
      try {
        const payload = JSON.parse(message.data) as EventLog;
        setEvents((prev) => [payload, ...prev].slice(0, 50));
      } catch (err) {
        console.error('Mensaje de WebSocket inválido', err);
      }
    };

    return () => ws.close();
  }, [wsUrl]);

  useEffect(() => {
    const fallback = async () => {
      try {
        const recent = await Api.recentEvents(auth);
        setEvents(recent);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    if (connection === 'closed') {
      void fallback();
    }
  }, [connection, auth.apiBase, auth.token]);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Eventos</p>
          <h2>Entradas y salidas en tiempo real</h2>
          <p className="muted">Escucha eventos por WebSocket o muestra el histórico más reciente.</p>
        </div>
        <span className={`status ${connection}`}>
          {connection === 'open' && 'Conectado'}
          {connection === 'connecting' && 'Conectando…'}
          {connection === 'closed' && 'Desconectado'}
        </span>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="timeline">
        {events.map((event) => (
          <article className="timeline-item" key={event.id + event.created_at}>
            <header>
              <strong>{event.event_type}</strong>
              <span className="muted">{format(new Date(event.created_at), 'HH:mm:ss')}</span>
            </header>
            <p className="muted">
              Dispositivo: {event.device_name || event.device_id} • Usuario: {event.user_name || event.user_id || 'N/A'}
            </p>
            {event.payload && <pre className="payload">{event.payload}</pre>}
          </article>
        ))}
        {!events.length && <p className="muted">Aún no hay eventos.</p>}
      </div>
    </section>
  );
};
