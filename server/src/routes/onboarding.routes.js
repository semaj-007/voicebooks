import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { completeOnboarding, findRowById, setSageStatus, toPublic } from '../models/accounts.js';
import { sageSchema } from '../validators/auth.schemas.js';

const router = Router();
router.use(authenticate);

// PUT /api/onboarding/sage
router.put('/sage', validate(sageSchema), (req, res) => {
  const { action, region } = req.body;
  // TODO: for "connect", start the Sage OAuth 2.0 authorization-code flow and
  // set the status to "connected" once the callback succeeds. "pending" until then.
  if (action === 'connect') setSageStatus(req.user.id, 'pending', region);
  else setSageStatus(req.user.id, 'skipped');
  res.json({ message: action === 'connect' ? 'Sage connection started.' : 'Sage setup skipped.' });
});

// POST /api/onboarding/complete
router.post('/complete', (req, res) => {
  completeOnboarding(req.user.id);
  res.json({ message: 'Onboarding complete.', user: toPublic(findRowById(req.user.id)) });
});

export default router;
