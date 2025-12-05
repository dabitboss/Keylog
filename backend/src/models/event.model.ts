export interface AccessEvent {
  id: number;
  user_id: number;
  device_id: number;
  direction: 'entry' | 'exit';
  status: 'allowed' | 'denied';
  occurred_at: Date;
}

export type NewAccessEvent = Omit<AccessEvent, 'id'>;

export interface DeviceEvent {
  id: number;
  device_id: number;
  event_type: 'ENTRY' | 'EXIT' | 'DENIED';
  occurred_at: Date;
  payload: Record<string, any> | null;
}

export type NewDeviceEvent = Omit<DeviceEvent, 'id'>;
