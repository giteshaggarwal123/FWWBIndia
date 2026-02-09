import { Router } from 'express';
import { AdminExpense } from '../models/AdminExpense.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_ADMIN_EXPENSES } from '../data/suprajaDemo.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { canApproveAdminExpense } from '../config/approvalMatrix.js';
import type { RoleType } from '../config/roles.js';
import { recordAudit } from './audit.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('admin-expenses'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...DEMO_ADMIN_EXPENSES];
    const status = (req.query.status as string)?.trim();
    const category = (req.query.category as string)?.trim();
    if (status) list = list.filter((e) => e.status === status);
    if (category) list = list.filter((e) => e.category === category);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.status) q.status = req.query.status;
  if (req.query.category) q.category = req.query.category;
  let list = await AdminExpense.find(q).sort({ date: -1 }).lean();
  if (list.length === 0) {
    list = [...DEMO_ADMIN_EXPENSES] as typeof list;
    const status = (req.query.status as string)?.trim();
    const category = (req.query.category as string)?.trim();
    if (status) list = list.filter((e) => e.status === status);
    if (category) list = list.filter((e) => e.category === category);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  const submittedBy = req.user?.name || req.user?.username || 'Unknown';
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, submittedBy, status: req.body.status || 'submitted' };
    return res.status(201).json(synthetic);
  }
  const doc = await AdminExpense.create({ ...req.body, submittedBy });
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  const doc = await AdminExpense.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const newStatus = req.body.status as string | undefined;
  const roleType = req.user?.type as RoleType | undefined;
  if (newStatus === 'approved' || newStatus === 'rejected') {
    if (!roleType || !canApproveAdminExpense(roleType)) {
      return res.status(403).json({ message: 'You do not have permission to approve or reject admin expenses' });
    }
    if (req.user && newStatus === 'approved') (req.body as Record<string, unknown>).approvedBy = req.user.id;
    recordAudit(req, `admin_expense.${newStatus}`, 'AdminExpense', req.params.id, '');
  }
  if (!isDBConnected()) {
    const found = DEMO_ADMIN_EXPENSES.find((e: { _id: string }) => e._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await AdminExpense.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

export const adminExpenseRoutes = router;
