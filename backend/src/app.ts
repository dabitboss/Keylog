import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { checkConnection } from './db/pool';
import { errorHandler } from './middleware/error-handler';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  await checkConnection();
  res.json({ status: 'ok' });
});

app.use('/api', routes);
app.use(errorHandler);

export function createApp() {
  return app;
}

export { env };
