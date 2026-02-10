import { Router } from 'express';
import { Budget } from '../models/Budget.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { SUPRAJA_BUDGET } from '../data/suprajaDemo.js';
import { recordAudit } from './audit.js';

const router = Router();
router.use(requireAuth);

/** Distinct budget heads for a project (for activities dropdown). Allowed for activities + budget. */
router.get('/heads', requireRole('budget', 'activities', 'programs'), async (req: AuthRequest, res) => {
  const project = (req.query.project as string)?.trim();
  if (!project) return res.json([]);
  if (!isDBConnected()) {
    const list = SUPRAJA_BUDGET.filter((b) => (b.project as { _id?: string })?._id === project);
    const heads = [...new Set(list.map((b) => b.head).filter(Boolean))];
    return res.json(heads);
  }
  const list = await Budget.find({ project }).distinct('head').lean();
  res.json(list);
});

router.use(requireRole('budget'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...SUPRAJA_BUDGET];
    const project = (req.query.project as string)?.trim();
    const fy = (req.query.financialYear as string)?.trim();
    if (project) list = list.filter((b) => (b.project as { _id?: string })?._id === project);
    if (fy) list = list.filter((b) => b.financialYear === fy);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.project) q.project = req.query.project;
  if (req.query.financialYear) q.financialYear = req.query.financialYear;
  let list = await Budget.find(q).populate('project', 'name code').sort({ createdAt: -1 }).lean();
  if (list.length === 0) {
    list = [...SUPRAJA_BUDGET] as typeof list;
    if (req.query.project) list = list.filter((b) => (b.project as { _id?: string })?._id === req.query.project);
    if (req.query.financialYear) list = list.filter((b) => b.financialYear === req.query.financialYear);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body };
    return res.status(201).json(synthetic);
  }
  const doc = await Budget.create(req.body);
  recordAudit(req, 'budget.create', 'Budget', doc._id.toString(), (doc as { head?: string }).head);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = SUPRAJA_BUDGET.find((b: { _id: string }) => b._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await Budget.findById(req.params.id).populate('project').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = SUPRAJA_BUDGET.find((b: { _id: string }) => b._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  recordAudit(req, 'budget.update', 'Budget', req.params.id, (doc as { head?: string }).head);
  res.json(doc);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) return res.json({ deleted: true });
  const doc = await Budget.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  recordAudit(req, 'budget.delete', 'Budget', req.params.id, '');
  res.json({ deleted: true });
});

export const budgetRoutes = router;
