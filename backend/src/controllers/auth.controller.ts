import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import * as authService from '../services/auth.service';
import { HttpError } from '../services/auth.service';

function handleError(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  next(error);
}

export async function register(req: Request, res: Response, next: NextFunction) {
  const { name, email, password, role } = req.body || {};
  try {
    const { user, tokens } = await authService.register(name, email, password, role || 'user');
    res.status(201).json({ user, ...tokens });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body || {};
  try {
    const { user, tokens } = await authService.login(email, password);
    res.json({ user, ...tokens });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  const { refreshToken } = req.body || {};
  try {
    const { user, tokens } = await authService.refresh(refreshToken);
    res.json({ user, ...tokens });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function profile(req: AuthenticatedRequest, res: Response) {
  res.json({ user: req.user });
}
