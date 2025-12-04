import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as usersService from '../services/users.service';

export async function list(req: Request, res: Response) {
  const users = await usersService.listUsers();
  res.json(users);
}

export async function get(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = await usersService.getUser(id);
  if (!user) {
    res.status(404).json({ message: 'Usuario no encontrado' });
    return;
  }
  res.json(user);
}

export async function create(req: Request, res: Response) {
  const { name, email, password, role } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  const user = await usersService.createUser({ name, email, password_hash, role });
  res.status(201).json(user);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = await usersService.updateUser(id, req.body);
  if (!user) {
    res.status(404).json({ message: 'Usuario no encontrado' });
    return;
  }
  res.json(user);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await usersService.deleteUser(id);
  res.status(204).send();
}
