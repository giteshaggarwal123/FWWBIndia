import { Router } from 'express';
import { Report } from '../models/Report.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_REPORTS } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('reports'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...DEMO_REPORTS];
    if (req.query.project) list = list.filter((r: { project?: { _id: string } }) => r.project && (r.project as { _id: string })._id === req.query.project);
    if (req.query.type) list = list.filter((r: { type: string }) => r.type === req.query.type);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.project) q.project = req.query.project;
  if (req.query.type) q.type = req.query.type;
  let list = await Report.find(q).populate('project', 'name').populate('generatedBy', 'name').sort({ createdAt: -1 }).lean();
  if (list.length === 0) {
    list = [...DEMO_REPORTS] as typeof list;
    if (req.query.project) list = list.filter((r: { project?: { _id: string } }) => r.project && (r.project as { _id: string })._id === req.query.project);
    if (req.query.type) list = list.filter((r: { type: string }) => r.type === req.query.type);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, generatedBy: { name: req.user.name } };
    return res.status(201).json(synthetic);
  }
  const doc = await Report.create({ ...req.body, generatedBy: req.user.id });
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_REPORTS.find((r: { _id: string }) => r._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await Report.findById(req.params.id).populate('project').populate('generatedBy').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

export const reportRoutes = router;
