import { Router } from 'express';
import { InsurancePolicy } from '../models/InsurancePolicy.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_INSURANCE } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('insurance'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...DEMO_INSURANCE];
    if (req.query.type) list = list.filter((i: { type: string }) => i.type === req.query.type);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.type) q.type = req.query.type;
  let list = await InsurancePolicy.find(q).sort({ endDate: 1 }).lean();
  if (list.length === 0) {
    list = [...DEMO_INSURANCE] as typeof list;
    if (req.query.type) list = list.filter((i: { type: string }) => i.type === req.query.type);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, status: req.body.status || 'active' };
    return res.status(201).json(synthetic);
  }
  const doc = await InsurancePolicy.create(req.body);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_INSURANCE.find((i: { _id: string }) => i._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await InsurancePolicy.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = DEMO_INSURANCE.find((i: { _id: string }) => i._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await InsurancePolicy.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  if (!isDBConnected()) return res.json({ deleted: true });
  const doc = await InsurancePolicy.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ deleted: true });
});

export const insuranceRoutes = router;
