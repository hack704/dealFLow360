const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');
const seedData = require('./seed/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Initialize database connection
  await connectDB();

  // Auto-seed default demo dataset if database is empty
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[INFO] Database empty, auto-seeding demo records...');
      await seedData();
    }
  } catch (err) {
    console.warn('[WARN] Auto-seed check skipped:', err.message);
  }

  const http = require('http');
  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[ERROR] Port ${PORT} is already in use by another process.`);
      console.error(`[TIP] Kill the occupying process with: npx kill-port ${PORT} or lsof -ti :${PORT} | xargs kill -9\n`);
      process.exit(1);
    } else {
      console.error('[ERROR] Server error:', err.message);
      process.exit(1);
    }
  });

  server.listen(PORT, () => {
    console.log(`[INFO] DealFlow360 Server running on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    try {
      if (server && server.listening) {
        server.close();
      }
      const { disconnectDB } = require('./config/db');
      if (disconnectDB) await disconnectDB();
    } catch (_) {}
    if (signal === 'SIGUSR2') {
      process.kill(process.pid, 'SIGUSR2');
    } else {
      process.exit(0);
    }
  };

  process.once('SIGUSR2', () => shutdown('SIGUSR2'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return server;
};

const server = startServer();

module.exports = server;
