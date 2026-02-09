import { Router } from 'express';
import { Partner } from '../models/Partner.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_PARTNERS } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('partners', 'activities', 'reports', 'dashboard'));

router.get('/', async (_req: AuthRequest, res) => {
  if (!isDBConnected()) return res.json(DEMO_PARTNERS);
  let list = await Partner.find().sort({ name: 1 }).lean();
  if (list.length === 0) list = DEMO_PARTNERS as typeof list;
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, status: req.body.status || 'active' };
    return res.status(201).json(synthetic);
  }
  const doc = await Partner.create(req.body);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_PARTNERS.find((p: { _id: string }) => p._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await Partner.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const doc = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

export const partnerRoutes = router;
