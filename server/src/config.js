import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';

const isProd = process.env.NODE_ENV === 'production';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  if (isProd) throw new Error('JWT_SECRET must be set (32+ characters) in production');
  jwtSecret = crypto.randomBytes(48).toString('hex');
  console.warn('[config] JWT_SECRET missing or short: using a temporary one. Sessions reset on restart.');
}

export const config = {
  isProd,
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret,
  sessionMinutes: Number(process.env.SESSION_MINUTES) || 60,
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProd,
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
  resetTokenTtlMinutes: Number(process.env.RESET_TOKEN_TTL_MINUTES) || 30,
  databaseFile: path.resolve(process.env.DATABASE_FILE || './data/voicebooks.db'),
};
