import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import * as devicesService from '../services/devices.service';
import { Device } from '../models/device.model';

export interface DeviceRequest extends Request {
  device?: Device;
}

function timingSafeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'hex');
  const bufferB = Buffer.from(b, 'hex');
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

export async function verifyDeviceSignature(req: DeviceRequest, res: Response, next: NextFunction): Promise<void> {
  const readerId = req.header('x-reader-id');
  const signature = req.header('x-signature');
  const timestampHeader = req.header('x-timestamp');

  if (!readerId || !signature || !timestampHeader) {
    res.status(400).json({ message: 'Headers faltantes: X-Reader-Id, X-Signature, X-Timestamp' });
    return;
  }

  const timestampMs = Number(timestampHeader);
  if (Number.isNaN(timestampMs)) {
    res.status(400).json({ message: 'X-Timestamp inválido' });
    return;
  }

  const now = Date.now();
  if (Math.abs(now - timestampMs) > 5 * 60 * 1000) {
    res.status(401).json({ message: 'Solicitud expirada' });
    return;
  }

  const payload = req.body || {};
  if (!payload.bits || !payload.raw) {
    res.status(400).json({ message: 'Payload inválido: se requieren bits y raw' });
    return;
  }

  const device = await devicesService.findByReaderId(readerId);
  if (!device || !device.is_active) {
    res.status(403).json({ message: 'Dispositivo no autorizado o inactivo' });
    return;
  }
  if (!device.secret) {
    res.status(400).json({ message: 'Dispositivo sin secreto configurado' });
    return;
  }

  const message = `${readerId}|${payload.bits}|${payload.raw}|${timestampMs}`;
  const expected = crypto.createHmac('sha256', device.secret).update(message).digest('hex');
  if (!timingSafeCompare(expected, signature.toLowerCase())) {
    res.status(401).json({ message: 'Firma inválida' });
    return;
  }

  req.device = device;
  next();
}
