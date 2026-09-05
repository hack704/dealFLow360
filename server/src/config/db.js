const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  let mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    try {
      if (!mongod) {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
      }
      mongoURI = mongod.getUri();
      console.log(`[INFO] Started In-Memory MongoDB Server for development at: ${mongoURI}`);
    } catch (err) {
      console.warn(`[WARN] Could not initialize in-memory MongoDB: ${err.message}`);
    }
  }

  if (!mongoURI) {
    console.warn('[WARN] No MongoDB URI available. Database connection skipped.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[INFO] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[ERROR] MongoDB connection error: ${error.message}`);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error(`[ERROR] Error disconnecting database: ${error.message}`);
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
