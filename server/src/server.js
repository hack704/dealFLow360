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

  const server = app.listen(PORT, () => {
    console.log(`[INFO] DealFlow360 Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[ERROR] Port ${PORT} is already in use.`);
    } else {
      console.error('[ERROR] Server error:', err.message);
    }
  });

  const shutdown = (signal) => {
    server.close(() => {
      console.log(`[INFO] Closed server on ${signal}`);
      if (signal === 'SIGUSR2') {
        process.kill(process.pid, 'SIGUSR2');
      } else {
        process.exit(0);
      }
    });
  };

  process.once('SIGUSR2', () => shutdown('SIGUSR2'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return server;
};

const server = startServer();

module.exports = server;
