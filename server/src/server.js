const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Initialize database connection
connectDB();

const server = app.listen(PORT, () => {
  console.log(`[INFO] DealFlow360 Server running on port ${PORT}`);
});

module.exports = server;
