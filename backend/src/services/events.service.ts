import { pool } from '../db/pool';
import { AccessEvent, DeviceEvent, NewAccessEvent, NewDeviceEvent } from '../models/event.model';

export async function logEvent(data: NewAccessEvent): Promise<AccessEvent> {
  const result = await pool.query<AccessEvent>(
    `INSERT INTO access_events (user_id, device_id, direction, status, occurred_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.user_id, data.device_id, data.direction, data.status, data.occurred_at],
  );
  return result.rows[0];
}

export async function listEvents(limit = 50): Promise<AccessEvent[]> {
  const result = await pool.query<AccessEvent>(
    `SELECT * FROM access_events ORDER BY occurred_at DESC LIMIT $1`,
    [limit],
  );
  return result.rows;
}

export async function logDeviceEvent(data: NewDeviceEvent): Promise<DeviceEvent> {
  const result = await pool.query<DeviceEvent>(
    `INSERT INTO events (device_id, event_type, occurred_at, payload)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.device_id, data.event_type, data.occurred_at, data.payload],
  );
  return result.rows[0];
}
