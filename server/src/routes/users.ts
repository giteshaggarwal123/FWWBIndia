import { Router } from 'express';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { isDBConnected } from '../config/db.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { DEMO_USERS } from '../routes/auth.js';
import { recordAudit } from './audit.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireRole('user-mgmt', 'management', 'hr'), async (_req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const list = DEMO_USERS.map((u, i) => ({
      _id: `demo-${u.username}`,
      username: u.username,
      name: u.name,
      role: u.role,
      type: u.type,
    }));
    return res.json(list);
  }
  const list = await User.find().select('_id name username role type').lean();
  res.json(list.map((u) => ({ _id: u._id.toString(), name: u.name, username: u.username, role: u.role, type: u.type })));
});

router.post('/', requireRole('user-mgmt', 'management'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    return res.status(400).json({ message: 'User creation requires database. Use demo login for testing.' });
  }
  const { username, password, name, role, type } = req.body;
  if (!username || !password || !name || !type) {
    return res.status(400).json({ message: 'username, password, name, and type are required' });
  }
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ message: 'Username already exists' });
  const user = await User.create({ username, password, name, role: role || name, type });
  recordAudit(req, 'user.create', 'User', user._id.toString(), user.username);
  res.status(201).json({ _id: user._id.toString(), username: user.username, name: user.name, role: user.role, type: user.type });
});

router.patch('/:id', requireRole('user-mgmt', 'management'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    return res.status(400).json({ message: 'User update requires database.' });
  }
  const { name, role, type } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { ...(name && { name }), ...(role && { role }), ...(type && { type }) }, { new: true }).select('_id name username role type').lean();
  if (!user) return res.status(404).json({ message: 'Not found' });
  recordAudit(req, 'user.update', 'User', user._id.toString(), user.username);
  res.json({ ...user, _id: user._id.toString() });
});

export const usersRoutes = router;
