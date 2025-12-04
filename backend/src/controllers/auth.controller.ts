import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth';
import * as authService from '../services/auth.service';
import { pool } from '../db/pool';
import { User } from '../models/user.model';

export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body;
  try {
    const { user, tokens } = await authService.register(name, email, password, role || 'user');
    res.status(201).json({ user, ...tokens });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const { user, tokens } = await authService.login(email, password);
    res.json({ user, ...tokens });
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ message: 'Refresh token requerido' });
    return;
  }
  try {
    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as { sub: number };
    const result = await pool.query<User>('SELECT * FROM users WHERE id = $1', [decoded.sub]);
    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    const tokens = authService.refresh(user);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ message: 'Refresh token inválido' });
  }
}

export async function profile(req: AuthenticatedRequest, res: Response) {
  res.json({ user: req.user });
}
