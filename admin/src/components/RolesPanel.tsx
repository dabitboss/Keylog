import React, { useEffect, useState } from 'react';
import { Api } from '../api/client';
import { useAuth } from '../auth';
import { Role } from '../types';

export const RolesPanel: React.FC = () => {
  const auth = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadRoles = async () => {
    try {
      setError('');
      const data = await Api.listRoles(auth);
      setRoles(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setMessage('');
      setError('');
      const role = await Api.createRole(auth, { name, description });
      setRoles((prev) => [...prev, role]);
      setName('');
      setDescription('');
      setMessage('Rol creado.');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, [auth.apiBase, auth.token]);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Roles</p>
          <h2>Gestión de roles y permisos</h2>
          <p className="muted">Crea roles y consulta los existentes para asignarlos a usuarios.</p>
        </div>
        <button type="button" className="ghost" onClick={loadRoles}>
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
          <span>Descripción</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="actions">
          <button type="submit">Crear rol</button>
          {message && <span className="muted">{message}</span>}
        </div>
      </form>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.name}</td>
                <td className="muted">{role.description || '—'}</td>
                <td className="muted">{role.id}</td>
              </tr>
            ))}
            {!roles.length && (
              <tr>
                <td colSpan={3} className="muted">
                  No hay roles registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
