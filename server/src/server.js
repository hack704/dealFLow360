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

  return server;
};

const server = startServer();

module.exports = server;
