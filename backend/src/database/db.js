import mongoose from 'mongoose';
import { config } from '../config/env.js';

let isConnected = false;

export const connectDatabase = async () => {
  if (!config.mongodbUri || !config.mongodbDatabaseName) {
    throw new Error('MONGODB_URI must include the intended database name.');
  }

  if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be configured.');
  }
  if (!/^[\da-f]{64}$/i.test(config.face.encryptionKey)) {
    throw new Error('FACE_ENCRYPTION_KEY must be a 32-byte hexadecimal key.');
  }
  if (
    !Number.isFinite(config.face.matchThreshold) ||
    config.face.matchThreshold < 0.35 ||
    config.face.matchThreshold > 0.6
  ) {
    throw new Error('FACE_MATCH_THRESHOLD must be a number between 0.35 and 0.6.');
  }

  try {
    await mongoose.connect(config.mongodbUri, {
      dbName: config.mongodbDatabaseName,
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`Connected to MongoDB database "${mongoose.connection.name}".`);
    return true;
  } catch (err) {
    console.error('MongoDB connection failed:', err.name || 'ConnectionError');
    throw err;
  }
};

export const getDbStatus = () => {
  if (config.env === 'test') {
    return {
      connected: true,
      type: 'Isolated in-memory test adapter',
      database: null,
    };
  }

  return {
    connected: isConnected && mongoose.connection.readyState === 1,
    type: 'MongoDB (Mongoose)',
    database: isConnected ? mongoose.connection.name : config.mongodbDatabaseName || null,
  };
};
