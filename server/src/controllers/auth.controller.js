import { config } from '../config.js';
import * as accounts from '../models/accounts.js';
import {
  DUMMY_HASH, clearAuthCookie, hashPassword, newResetToken, setAuthCookie, sha256, signToken, verifyPassword,
} from '../utils/security.js';

// POST /api/auth/register: hash password, create user + business profile, sign in.
export async function register(req, res) {
  const { email, password, firstName, lastName, phone, role, business } = req.body;

  if (accounts.findRowByEmail(email)) {
    return res.status(409).json({
      message: 'An account with this email already exists.',
      errors: { email: 'This email is already registered' },
    });
  }

  const passwordHash = await hashPassword(password);
  let userId;
  try {
    userId = accounts.createUserWithBusiness({
      user: { email, passwordHash, firstName, lastName, phone, role },
      business,
    });
  } catch (err) {
    if (String(err.code).startsWith('SQLITE_CONSTRAINT')) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
        errors: { email: 'This email is already registered' },
      });
    }
    throw err;
  }

  const user = accounts.toPublic(accounts.findRowById(userId));
  setAuthCookie(res, signToken(user)); // account creation signs the user in
  res.status(201).json({ message: 'Account created.', user });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  const row = accounts.findRowByEmail(email);
  const ok = await verifyPassword(password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !ok) return res.status(401).json({ message: 'Incorrect email or password.' });

  const user = accounts.toPublic(row);
  setAuthCookie(res, signToken(user));
  res.json({ message: 'Signed in.', user });
}

// POST /api/auth/forgot-password: same response whether or not the email exists.
export async function forgotPassword(req, res) {
  const response = { message: 'If an account exists for that email, a reset link is on its way.' };
  const row = accounts.findRowByEmail(req.body.email);

  if (row) {
    const { raw, hash } = newResetToken();
    const expiresAt = new Date(Date.now() + config.resetTokenTtlMinutes * 60_000).toISOString();
    accounts.saveResetToken(row.id, hash, expiresAt);

    const link = `${config.clientOrigin}/reset-password?token=${raw}`;
    // TODO: send `link` with your email provider (SES, SendGrid, Resend, ...).
    console.log(`[mail] Password reset link for ${row.email}: ${link}`);
    if (!config.isProd) response.devResetLink = link; // dev convenience only
  }
  res.json(response);
}

// POST /api/auth/reset-password: token is single-use and expires.
export async function resetPassword(req, res) {
  const { token, password } = req.body;
  const record = accounts.findValidResetToken(sha256(token));
  if (!record) {
    return res.status(400).json({
      message: 'This reset link is invalid or has expired. Request a new one.',
      errors: { token: 'This reset link is invalid or has expired' },
    });
  }
  accounts.consumeResetToken(record.id, record.user_id, await hashPassword(password));
  res.json({ message: 'Password updated. You can now sign in.' });
}

// GET /api/auth/profile (protected)
export const profile = (req, res) => res.json({ user: req.user });

// POST /api/auth/logout
export function logout(req, res) {
  clearAuthCookie(res);
  res.json({ message: 'Signed out.' });
}
