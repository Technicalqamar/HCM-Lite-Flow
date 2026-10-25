import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });

const mongodbUri = process.env.MONGODB_URI || '';
const uriDatabaseName = mongodbUri ? decodeURIComponent(new URL(mongodbUri).pathname.slice(1)) : '';
const configuredDatabaseName = process.env.MONGODB_DATABASE || '';

if (configuredDatabaseName && uriDatabaseName && configuredDatabaseName !== uriDatabaseName) {
  throw new Error('MONGODB_DATABASE must match the database name in MONGODB_URI.');
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri,
  mongodbDatabaseName: configuredDatabaseName || uriDatabaseName,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '2h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  face: {
    encryptionKey: process.env.FACE_ENCRYPTION_KEY || '',
    matchThreshold: Number.parseFloat(process.env.FACE_MATCH_THRESHOLD || '0.48'),
  },
  admin: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
  },
  ai: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-3.8-flash',
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '30000', 10),
  },
};
