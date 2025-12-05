export interface Device {
  id: number;
  name: string;
  type: 'rfid' | 'wiegand' | 'esp32' | 'other';
  location: string | null;
  is_active: boolean;
  last_seen_at: Date | null;
  reader_id?: string | null;
  secret?: string | null;
}

export type NewDevice = Omit<Device, 'id' | 'last_seen_at'>;
export type UpdateDevice = Partial<Omit<Device, 'id'>>;
