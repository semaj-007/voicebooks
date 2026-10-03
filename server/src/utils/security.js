import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { config } from '../config.js';

export const COOKIE_NAME = 'vb_token';

// ---- Passwords: bcrypt with a per-password salt ----
export const hashPassword = (plain) => bcrypt.hash(plain, config.bcryptRounds);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);
// Compared against when the email is unknown so login timing doesn't reveal which emails exist.
export const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', config.bcryptRounds);

// ---- JWT ----
export const signToken = (user) =>
  jwt.sign({ sub: String(user.id), role: user.role }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: `${config.sessionMinutes}m`,
  });

export const verifyToken = (token) =>
  jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });

// httpOnly cookie: JavaScript (and therefore XSS) can't read the token.
const cookieOptions = () => ({
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: 'lax',
  path: '/',
});
export const setAuthCookie = (res, token) =>
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: config.sessionMinutes * 60 * 1000 });
export const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, cookieOptions());

// ---- Password reset tokens ----
export const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
export const newResetToken = () => {
  const raw = crypto.randomBytes(32).toString('hex'); // 64 hex chars, sent to the user
  return { raw, hash: sha256(raw) }; // only the hash is stored
};
