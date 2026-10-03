import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { listUsers } from '../models/accounts.js';

const router = Router();
router.use(authenticate, requireRole('admin')); // role-based access control

router.get('/users', (req, res) => {
  res.json({
    users: listUsers().map((u) => ({
      id: u.id,
      email: u.email,
      name: `${u.first_name} ${u.last_name}`,
      role: u.role,
      business: u.business_name,
      createdAt: u.created_at,
    })),
  });
});

export default router;
