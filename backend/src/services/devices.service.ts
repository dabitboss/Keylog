import { pool } from '../db/pool';
import { Device, NewDevice, UpdateDevice } from '../models/device.model';

export async function listDevices(): Promise<Device[]> {
  const result = await pool.query<Device>('SELECT * FROM devices ORDER BY id DESC');
  return result.rows;
}

export async function registerDevice(data: NewDevice): Promise<Device> {
  const result = await pool.query<Device>(
    `INSERT INTO devices (name, type, location, is_active, last_seen_at, reader_id, secret)
     VALUES ($1, $2, $3, $4, NULL, $5, $6) RETURNING *`,
    [data.name, data.type, data.location, data.is_active, data.reader_id || null, data.secret || null],
  );
  return result.rows[0];
}

export async function updateDevice(id: number, updates: UpdateDevice): Promise<Device | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(value);
      index += 1;
    }
  });

  if (!fields.length) {
    const result = await pool.query<Device>('SELECT * FROM devices WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  const query = `UPDATE devices SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
  values.push(id);
  const result = await pool.query<Device>(query, values);
  return result.rows[0] || null;
}

export async function findByReaderId(readerId: string): Promise<Device | null> {
  const result = await pool.query<Device>('SELECT * FROM devices WHERE reader_id = $1 LIMIT 1', [readerId]);
  return result.rows[0] || null;
}

export async function touchLastSeen(id: number, seenAt: Date): Promise<void> {
  await pool.query('UPDATE devices SET last_seen_at = $1 WHERE id = $2', [seenAt, id]);
}
