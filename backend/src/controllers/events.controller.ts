import { Request, Response } from 'express';
import * as eventsService from '../services/events.service';

export async function list(req: Request, res: Response) {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const events = await eventsService.listEvents(limit);
  res.json(events);
}

export async function create(req: Request, res: Response) {
  const event = await eventsService.logEvent({ ...req.body, occurred_at: new Date() });
  res.status(201).json(event);
}
