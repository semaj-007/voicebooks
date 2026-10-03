import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/auth.controller.js';
import {
  forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema,
} from '../validators/auth.schemas.js';

const router = Router();

// Slows down brute-force and token-guessing attempts.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.isProd ? 20 : 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

router.post('/register', limiter, validate(registerSchema), ctrl.register);
router.post('/login', limiter, validate(loginSchema), ctrl.login);
router.post('/forgot-password', limiter, validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post('/reset-password', limiter, validate(resetPasswordSchema), ctrl.resetPassword);
router.post('/logout', ctrl.logout);
router.get('/profile', authenticate, ctrl.profile);

export default router;
