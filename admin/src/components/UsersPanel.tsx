import React, { useEffect, useState } from 'react';
import { Api } from '../api/client';
import { useAuth } from '../auth';
import { User } from '../types';
import { format } from 'date-fns';

export const UsersPanel: React.FC = () => {
  const auth = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await Api.listUsers(auth);
      setUsers(response);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [auth.apiBase, auth.token]);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Usuarios</p>
          <h2>Listado y roles asignados</h2>
          <p className="muted">Consulta usuarios registrados y el rol asociado.</p>
        </div>
        <button type="button" onClick={loadUsers} className="ghost">
          Refrescar
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Activo</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td className="muted">{user.email}</td>
                <td>{user.role_name || user.role_id || '—'}</td>
                <td>{user.active ? 'Sí' : 'No'}</td>
                <td>{user.created_at ? format(new Date(user.created_at), 'yyyy-MM-dd HH:mm') : '—'}</td>
              </tr>
            ))}
            {!users.length && !loading && (
              <tr>
                <td colSpan={5} className="muted">
                  No hay usuarios cargados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && <p className="muted">Cargando usuarios…</p>}
      </div>
    </section>
  );
};
