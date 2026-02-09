import { Router } from 'express';
import { Grant } from '../models/Grant.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('donor-mgmt', 'programs', 'dashboard'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) return res.json([]);
  const q: Record<string, unknown> = {};
  if (req.query.donor) q.donor = req.query.donor;
  if (req.query.project) q.project = req.query.project;
  const list = await Grant.find(q)
    .populate('donor', 'name code')
    .populate('project', 'name code')
    .sort({ periodStart: -1 })
    .lean();
  res.json(list);
});

router.post('/', requireRole('donor-mgmt', 'programs'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-grant-${Date.now()}`, ...req.body, donor: { _id: req.body.donor, name: '' }, project: { _id: req.body.project, name: '' } };
    return res.status(201).json(synthetic);
  }
  const doc = await Grant.create(req.body);
  const populated = await Grant.findById(doc._id).populate('donor', 'name code').populate('project', 'name code').lean();
  res.status(201).json(populated);
});

router.patch('/:id', requireRole('donor-mgmt', 'programs'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) return res.status(404).json({ message: 'Not found' });
  const doc = await Grant.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('donor', 'name code')
    .populate('project', 'name code')
    .lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.delete('/:id', requireRole('donor-mgmt', 'programs'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) return res.json({ deleted: true });
  const doc = await Grant.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ deleted: true });
});

export const grantRoutes = router;
