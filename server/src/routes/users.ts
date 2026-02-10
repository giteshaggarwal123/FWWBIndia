import { Router } from 'express';
import { User } from '../models/User.js';
import { Employee } from '../models/Employee.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { isDBConnected } from '../config/db.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { DEMO_USERS } from '../routes/auth.js';
import { recordAudit } from './audit.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireRole('user-mgmt'), async (_req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const list = DEMO_USERS.map((u) => ({
      _id: `demo-${u.username}`,
      username: u.username,
      name: u.name,
      role: u.role,
      type: u.type,
      employee: null as { _id: string; name: string; employeeId: string } | null,
    }));
    return res.json(list);
  }
  const list = await User.find().select('_id name username role type').lean();
  const userIds = list.map((u) => u._id);
  const employees = await Employee.find({ userId: { $in: userIds } }).select('_id name employeeId userId').lean();
  const empByUser = new Map<string | unknown, (typeof employees)[0]>();
  employees.forEach((e) => { if (e.userId) empByUser.set(e.userId.toString(), e); });
  res.json(list.map((u) => {
    const emp = empByUser.get(u._id.toString());
    return {
      _id: u._id.toString(),
      name: u.name,
      username: u.username,
      role: u.role,
      type: u.type,
      employee: emp ? { _id: emp._id.toString(), name: emp.name, employeeId: emp.employeeId } : null,
    };
  }));
});

router.post('/', requireRole('user-mgmt'), async (req: AuthRequest, res) => {
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

router.patch('/:id', requireRole('user-mgmt'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    return res.status(400).json({ message: 'User update requires database.' });
  }
  const { name, role, type } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { ...(name && { name }), ...(role && { role }), ...(type && { type }) }, { new: true }).select('_id name username role type').lean();
  if (!user) return res.status(404).json({ message: 'Not found' });
  recordAudit(req, 'user.update', 'User', user._id.toString(), user.username);
  res.json({ ...user, _id: user._id.toString() });
});

/** Link or unlink an employee to this user. Body: { employeeId: string | null } */
router.patch('/:id/link-employee', requireRole('user-mgmt'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    return res.status(400).json({ message: 'Link employee requires database.' });
  }
  const userId = req.params.id;
  const employeeId = req.body.employeeId != null && req.body.employeeId !== '' ? req.body.employeeId : null;
  await Employee.updateMany({ userId }, { $unset: { userId: 1 } });
  if (employeeId) {
    const emp = await Employee.findByIdAndUpdate(employeeId, { userId }, { new: true }).lean();
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
  }
  res.json({ ok: true });
});

export const usersRoutes = router;
