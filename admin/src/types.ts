export interface User {
  id: number;
  name: string;
  email: string;
  role_id?: number;
  role_name?: string;
  active?: boolean;
  created_at?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface Device {
  id: number;
  name: string;
  type: string;
  status?: 'online' | 'offline' | 'unknown';
  last_seen_at?: string | null;
  location?: string;
  secret_set?: boolean;
}

export interface EventLog {
  id: number;
  device_id: number;
  user_id?: number | null;
  event_type: string;
  payload?: string | null;
  created_at: string;
  device_name?: string;
  user_name?: string;
}

export interface ApiError {
  message: string;
}
