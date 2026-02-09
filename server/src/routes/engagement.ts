import { Router } from 'express';
import { EngagementSurvey } from '../models/Engagement.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_ENGAGEMENT } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('engagement'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...DEMO_ENGAGEMENT];
    if (req.query.status) list = list.filter((e: { status: string }) => e.status === req.query.status);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.status) q.status = req.query.status;
  let list = await EngagementSurvey.find(q).sort({ launchDate: -1 }).lean();
  if (list.length === 0) {
    list = [...DEMO_ENGAGEMENT] as typeof list;
    if (req.query.status) list = list.filter((e: { status: string }) => e.status === req.query.status);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, status: req.body.status || 'draft' };
    return res.status(201).json(synthetic);
  }
  const doc = await EngagementSurvey.create(req.body);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_ENGAGEMENT.find((e: { _id: string }) => e._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await EngagementSurvey.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = DEMO_ENGAGEMENT.find((e: { _id: string }) => e._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await EngagementSurvey.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

export const engagementRoutes = router;
