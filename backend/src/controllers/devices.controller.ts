import { Request, Response } from 'express';
import * as devicesService from '../services/devices.service';

export async function list(_req: Request, res: Response) {
  const devices = await devicesService.listDevices();
  res.json(devices);
}

export async function register(req: Request, res: Response) {
  const { name, type, location, is_active } = req.body;
  const device = await devicesService.registerDevice({ name, type, location, is_active });
  res.status(201).json(device);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const device = await devicesService.updateDevice(id, req.body);
  if (!device) {
    res.status(404).json({ message: 'Dispositivo no encontrado' });
    return;
  }
  res.json(device);
}
