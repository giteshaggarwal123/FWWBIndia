import { Router } from 'express';
import { PerformanceReview } from '../models/PerformanceReview.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_PERFORMANCE } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('performance'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...DEMO_PERFORMANCE];
    if (req.query.status) list = list.filter((p: { status: string }) => p.status === req.query.status);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.employee) q.employee = req.query.employee;
  if (req.query.status) q.status = req.query.status;
  let list = await PerformanceReview.find(q)
    .populate('employee', 'name employeeId designation')
    .populate('reviewer', 'name')
    .sort({ createdAt: -1 })
    .lean();
  if (list.length === 0) {
    list = [...DEMO_PERFORMANCE] as typeof list;
    if (req.query.status) list = list.filter((p: { status: string }) => p.status === req.query.status);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, status: req.body.status || 'pending' };
    return res.status(201).json(synthetic);
  }
  const doc = await PerformanceReview.create(req.body);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_PERFORMANCE.find((p: { _id: string }) => p._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await PerformanceReview.findById(req.params.id).populate('employee').populate('reviewer').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = DEMO_PERFORMANCE.find((p: { _id: string }) => p._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await PerformanceReview.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

export const performanceRoutes = router;
