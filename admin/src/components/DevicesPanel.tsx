import React, { useEffect, useState } from 'react';
import { Api } from '../api/client';
import { useAuth } from '../auth';
import { Device } from '../types';
import { format } from 'date-fns';

export const DevicesPanel: React.FC = () => {
  const auth = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('wiegand');
  const [location, setLocation] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadDevices = async () => {
    try {
      setError('');
      const response = await Api.listDevices(auth);
      setDevices(response);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError('');
      setMessage('');
      const payload: Partial<Device> & { secret?: string } = { name, type, location };
      if (secret) payload.secret = secret;
      const newDevice = await Api.createDevice(auth, payload);
      setDevices((prev) => [...prev, newDevice]);
      setName('');
      setLocation('');
      setSecret('');
      setMessage('Dispositivo agregado.');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    void loadDevices();
  }, [auth.apiBase, auth.token]);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Dispositivos</p>
          <h2>Control de dispositivos y lectores</h2>
          <p className="muted">Agrega lectores RFID/Wiegand o ESP32 y revisa su estado.</p>
        </div>
        <button className="ghost" type="button" onClick={loadDevices}>
          Refrescar
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <form className="grid two-cols gap" onSubmit={handleCreate}>
        <label className="field">
          <span>Nombre</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="field">
          <span>Tipo</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="wiegand">Wiegand</option>
            <option value="rfid">RFID</option>
            <option value="esp32">ESP32</option>
          </select>
        </label>
        <label className="field">
          <span>Ubicación</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Laboratorio / Acceso principal" />
        </label>
        <label className="field">
          <span>Secreto (HMAC)</span>
          <input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Opcional" />
        </label>
        <div className="actions">
          <button type="submit">Agregar</button>
          {message && <span className="muted">{message}</span>}
        </div>
      </form>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Ubicación</th>
              <th>Último ping</th>
              <th>Secreto</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id}>
                <td>{device.name}</td>
                <td className="muted">{device.type}</td>
                <td>{device.location || '—'}</td>
                <td>{device.last_seen_at ? format(new Date(device.last_seen_at), 'yyyy-MM-dd HH:mm') : 'Nunca'}</td>
                <td>{device.secret_set ? '✅ configurado' : '⚠️ faltante'}</td>
              </tr>
            ))}
            {!devices.length && (
              <tr>
                <td colSpan={5} className="muted">
                  No hay dispositivos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
