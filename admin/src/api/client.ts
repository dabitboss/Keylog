import { ApiError, Device, EventLog, Role, User } from '../types';
import { useAuth } from '../auth';

export const useApiBase = () => useAuth();

const parseJson = async (response: Response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error('La respuesta no es un JSON válido');
  }
};

export const apiFetch = async <T>(
  auth: ReturnType<typeof useAuth>,
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(`${auth.apiBase}${path}`, {
    ...options,
    headers,
  });

  const data = await parseJson(response);

  if (!response.ok) {
    const err = data as ApiError;
    throw new Error(err?.message || 'Error inesperado');
  }

  return data as T;
};

export const Api = {
  listUsers: (auth: ReturnType<typeof useAuth>) => apiFetch<User[]>(auth, '/users'),
  listRoles: (auth: ReturnType<typeof useAuth>) => apiFetch<Role[]>(auth, '/roles'),
  createRole: (auth: ReturnType<typeof useAuth>, payload: Partial<Role>) =>
    apiFetch<Role>(auth, '/roles', { method: 'POST', body: JSON.stringify(payload) }),
  listDevices: (auth: ReturnType<typeof useAuth>) => apiFetch<Device[]>(auth, '/devices'),
  createDevice: (auth: ReturnType<typeof useAuth>, payload: Partial<Device>) =>
    apiFetch<Device>(auth, '/devices', { method: 'POST', body: JSON.stringify(payload) }),
  recentEvents: (auth: ReturnType<typeof useAuth>) => apiFetch<EventLog[]>(auth, '/events?limit=25'),
};
