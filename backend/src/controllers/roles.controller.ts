import { Request, Response } from 'express';
import * as rolesService from '../services/roles.service';

export async function list(_req: Request, res: Response) {
  const roles = await rolesService.listRoles();
  res.json(roles);
}

export async function create(req: Request, res: Response) {
  const { name, permissions } = req.body;
  const role = await rolesService.createRole({ name, permissions });
  res.status(201).json(role);
}
