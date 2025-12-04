import { NextFunction, Request, Response } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const status = (err as any).status || 500;
  res.status(status).json({ message: err.message || 'Error interno' });
}
