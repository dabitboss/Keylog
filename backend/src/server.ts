import { createApp, env } from './app';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Keylog API escuchando en puerto ${env.port}`);
});
