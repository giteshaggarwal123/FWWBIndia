import { Router } from 'express';
import { Activity } from '../models/Activity.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { SUPRAJA_ACTIVITIES } from '../data/suprajaDemo.js';
import { recordAudit } from './audit.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('activities'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...SUPRAJA_ACTIVITIES];
    const project = (req.query.project as string)?.trim();
    if (project) list = list.filter((a) => (a.project as { _id?: string })?._id === project);
    const status = (req.query.status as string)?.trim();
    if (status) list = list.filter((a) => a.status === status);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.project) q.project = req.query.project;
  if (req.query.status) q.status = req.query.status as string;
  let list = await Activity.find(q).populate('project', 'name code').sort({ createdAt: -1 }).lean();
  if (list.length === 0) {
    list = [...SUPRAJA_ACTIVITIES] as typeof list;
    if (req.query.project) list = list.filter((a) => (a.project as { _id?: string })?._id === req.query.project);
    if (req.query.status) list = list.filter((a) => a.status === req.query.status);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, status: req.body.status || 'planned' };
    return res.status(201).json(synthetic);
  }
  const doc = await Activity.create(req.body);
  recordAudit(req, 'activity.create', 'Activity', doc._id.toString(), (doc as { name?: string }).name);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = SUPRAJA_ACTIVITIES.find((a: { _id: string }) => a._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await Activity.findById(req.params.id).populate('project').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = SUPRAJA_ACTIVITIES.find((a: { _id: string }) => a._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  recordAudit(req, 'activity.update', 'Activity', req.params.id, (doc as { name?: string }).name);
  res.json(doc);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) return res.json({ deleted: true });
  const doc = await Activity.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  recordAudit(req, 'activity.delete', 'Activity', req.params.id, '');
  res.json({ deleted: true });
});

export const activityRoutes = router;
