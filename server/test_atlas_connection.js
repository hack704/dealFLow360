const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const testConnection = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<db_username>')) {
    console.error('[ERROR] MONGODB_URI is not configured with a valid username yet.');
    console.log('[INFO] Current URI in server/.env:', uri);
    process.exit(1);
  }

  console.log('[INFO] Connecting to MongoDB Atlas...');
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[SUCCESS] Connected to MongoDB Atlas! Host: ${conn.connection.host}`);
    console.log(`[SUCCESS] Database Name: ${conn.connection.name}`);
    
    // Test write and read
    const testCollection = conn.connection.collection('__connection_test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    const doc = await testCollection.findOne({ test: true });
    await testCollection.drop();
    console.log('[SUCCESS] Write & read operations verified on Atlas cluster!');
    
    await mongoose.disconnect();
    console.log('[INFO] Test completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error(`[ERROR] Atlas connection failed: ${err.message}`);
    process.exit(1);
  }
};

testConnection();
