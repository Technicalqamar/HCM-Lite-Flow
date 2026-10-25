import { createApp } from './app.js';
import { connectDatabase } from './database/db.js';
import { config } from './config/env.js';

const startServer = async () => {
  await connectDatabase();
  const app = createApp();

  app.listen(config.port, () => {
    console.log(`HCM Lite Backend Server running on port ${config.port} [${config.env}]`);
  });
};

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err.name || 'Error');
  process.exit(1);
});
