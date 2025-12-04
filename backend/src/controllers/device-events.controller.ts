import { Response } from 'express';
import { DeviceRequest } from '../middleware/device-auth';
import * as eventsService from '../services/events.service';
import * as devicesService from '../services/devices.service';

export async function ingestWiegand(req: DeviceRequest, res: Response) {
  const device = req.device;
  if (!device) {
    res.status(401).json({ message: 'Dispositivo no autenticado' });
    return;
  }

  if (!['wiegand', 'esp32'].includes(device.type)) {
    res.status(403).json({ message: 'Tipo de dispositivo no permitido para Wiegand' });
    return;
  }

  const { bits, raw, value, timestamp_ms } = req.body;
  const occurredAt = timestamp_ms ? new Date(Number(timestamp_ms)) : new Date();

  const event = await eventsService.logDeviceEvent({
    device_id: device.id,
    event_type: 'ENTRY',
    occurred_at: occurredAt,
    payload: {
      reader_id: device.reader_id,
      bits,
      raw,
      value,
      timestamp_ms,
    },
  });

  await devicesService.touchLastSeen(device.id, occurredAt);

  res.status(201).json({ message: 'Evento registrado', event });
}
