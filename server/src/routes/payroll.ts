import { Router } from 'express';
import { PayrollRun } from '../models/PayrollRun.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_PAYROLL } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('payroll'));

router.get('/', async (_req: AuthRequest, res) => {
  if (!isDBConnected()) return res.json(DEMO_PAYROLL);
  let list = await PayrollRun.find().sort({ year: -1, month: -1 }).lean();
  if (list.length === 0) list = DEMO_PAYROLL as typeof list;
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, status: req.body.status || 'draft' };
    return res.status(201).json(synthetic);
  }
  const doc = await PayrollRun.create(req.body);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_PAYROLL.find((p: { _id: string }) => p._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await PayrollRun.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = DEMO_PAYROLL.find((p: { _id: string }) => p._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await PayrollRun.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

export const payrollRoutes = router;
