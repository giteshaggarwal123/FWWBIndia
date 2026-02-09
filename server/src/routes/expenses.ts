import { Router } from 'express';
import { Expense } from '../models/Expense.js';
import { Budget } from '../models/Budget.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_EXPENSES } from '../data/suprajaDemo.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { canVerifyExpense, canApproveExpense } from '../config/approvalMatrix.js';
import type { RoleType } from '../config/roles.js';
import { recordAudit } from './audit.js';

async function syncExpenseToBudget(projectId: unknown, headMatch: string, amount: number): Promise<void> {
  if (!headMatch || amount <= 0) return;
  await Budget.updateMany(
    { project: projectId, head: headMatch },
    { $inc: { utilized: amount } }
  );
}

const router = Router();
router.use(requireAuth);
router.use(requireRole('expenses'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...DEMO_EXPENSES];
    const project = (req.query.project as string)?.trim();
    const status = (req.query.status as string)?.trim();
    if (project) list = list.filter((e) => (e.project as { _id?: string })?._id === project);
    if (status) list = list.filter((e) => e.status === status);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.project) q.project = req.query.project;
  if (req.query.status) q.status = req.query.status;
  let list = await Expense.find(q)
    .populate('project', 'name')
    .populate('activity', 'name')
    .populate('submittedBy', 'name username')
    .sort({ date: -1 })
    .lean();
  if (list.length === 0) {
    list = [...DEMO_EXPENSES] as typeof list;
    const project = (req.query.project as string)?.trim();
    const status = (req.query.status as string)?.trim();
    if (project) list = list.filter((e) => (e.project as { _id?: string })?._id === project);
    if (status) list = list.filter((e) => e.status === status);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, submittedBy: { name: req.user.name }, status: req.body.status || 'submitted' };
    return res.status(201).json(synthetic);
  }
  const doc = await Expense.create({ ...req.body, submittedBy: req.user.id });
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_EXPENSES.find((e: { _id: string }) => e._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await Expense.findById(req.params.id)
    .populate('project')
    .populate('activity')
    .populate('submittedBy', 'name username')
    .lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const newStatus = req.body.status as string | undefined;
  const roleType = req.user?.type as RoleType | undefined;

  if (newStatus === 'verified') {
    if (!roleType || !canVerifyExpense(roleType)) {
      return res.status(403).json({ message: 'You do not have permission to verify expenses' });
    }
  }
  if (newStatus === 'approved' || newStatus === 'rejected') {
    if (!roleType) {
      return res.status(403).json({ message: 'Not authenticated' });
    }
    if (!isDBConnected()) {
      const found = DEMO_EXPENSES.find((e: { _id: string }) => e._id === req.params.id);
      const amount = (found as { amount?: number } | undefined)?.amount ?? 0;
      if (!canApproveExpense(roleType, amount)) {
        return res.status(403).json({ message: 'You do not have permission to approve or reject this expense' });
      }
    } else {
      const existing = await Expense.findById(req.params.id).select('amount').lean();
      if (!existing) return res.status(404).json({ message: 'Not found' });
      if (!canApproveExpense(roleType, existing.amount)) {
        return res.status(403).json({ message: 'You do not have permission to approve or reject this expense (amount may exceed your limit)' });
      }
    }
    if (req.user && newStatus === 'approved') (req.body as Record<string, unknown>).approvedBy = req.user.id;
    if (newStatus === 'verified') recordAudit(req, 'expense.verified', 'Expense', req.params.id, '');
    if (newStatus === 'approved' || newStatus === 'rejected') recordAudit(req, `expense.${newStatus}`, 'Expense', req.params.id, '');
  }

  if (!isDBConnected()) {
    const found = DEMO_EXPENSES.find((e: { _id: string }) => e._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const existing = await Expense.findById(req.params.id).select('status project budgetHead category amount').lean();
  const doc = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('approvedBy', 'name')
    .lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  const prevStatus = existing?.status;
  const nowApprovedOrSettled = (newStatus === 'approved' || newStatus === 'settled') && prevStatus !== 'approved' && prevStatus !== 'settled';
  if (nowApprovedOrSettled && doc.project && doc.amount) {
    const headMatch = (doc.budgetHead || doc.category || '').trim();
    if (headMatch) await syncExpenseToBudget(doc.project, headMatch, doc.amount);
  }
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  if (!isDBConnected()) return res.json({ deleted: true });
  const doc = await Expense.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ deleted: true });
});

export const expenseRoutes = router;
