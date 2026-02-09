import { Router } from 'express';
import { Asset } from '../models/Asset.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_ASSETS } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('assets'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...DEMO_ASSETS];
    if (req.query.type) list = list.filter((a: { type?: string }) => a.type === req.query.type);
    if (req.query.status) list = list.filter((a: { status: string }) => a.status === req.query.status);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.type) q.type = req.query.type;
  if (req.query.status) q.status = req.query.status;
  let list = await Asset.find(q).populate('assignedTo', 'name employeeId').sort({ createdAt: -1 }).lean();
  if (list.length === 0) {
    list = [...DEMO_ASSETS] as typeof list;
    if (req.query.type) list = list.filter((a: { type?: string }) => a.type === req.query.type);
    if (req.query.status) list = list.filter((a: { status: string }) => a.status === req.query.status);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, status: req.body.status || 'active' };
    return res.status(201).json(synthetic);
  }
  const doc = await Asset.create(req.body);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_ASSETS.find((a: { _id: string }) => a._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await Asset.findById(req.params.id).populate('assignedTo').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = DEMO_ASSETS.find((a: { _id: string }) => a._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  if (!isDBConnected()) return res.json({ deleted: true });
  const doc = await Asset.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ deleted: true });
});

export const assetRoutes = router;
