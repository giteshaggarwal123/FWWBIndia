import { Router } from 'express';
import { Project } from '../models/Project.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_PROJECTS, DEMO_PARTNERS } from '../data/suprajaDemo.js';
import { recordAudit } from './audit.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('programs', 'activities', 'budget', 'expenses', 'monitoring', 'reports'));

function hydratePartner(projects: { partner?: string | { _id: string; name?: string; code?: string } }[]) {
  return projects.map((p) => {
    const partnerId = typeof p.partner === 'string' ? p.partner : (p.partner as { _id: string })?._id;
    const partner = partnerId ? DEMO_PARTNERS.find((x: { _id: string }) => x._id === partnerId) : null;
    return { ...p, partner: partner ? { _id: partner._id, name: partner.name, code: partner.code } : undefined };
  });
}

router.get('/', async (_req: AuthRequest, res) => {
  if (!isDBConnected()) {
    return res.json(hydratePartner(DEMO_PROJECTS as { partner?: string }[]));
  }
  let list = await Project.find().sort({ createdAt: -1 }).populate('partner', 'name code').lean();
  if (list.length === 0) list = hydratePartner(DEMO_PROJECTS as { partner?: string }[]) as typeof list;
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, status: req.body.status || 'active' };
    const [hydrated] = hydratePartner([synthetic as { partner?: string }]);
    return res.status(201).json(hydrated);
  }
  const doc = await Project.create({ ...req.body });
  recordAudit(req, 'project.create', 'Project', doc._id.toString(), doc.name);
  const populated = await Project.findById(doc._id).populate('partner', 'name code').lean();
  res.status(201).json(populated);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_PROJECTS.find((p: { _id: string }) => p._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    const [hydrated] = hydratePartner([doc as { partner?: string }]);
    return res.json(hydrated);
  }
  const doc = await Project.findById(req.params.id).populate('partner', 'name code').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = DEMO_PROJECTS.find((p: { _id: string }) => p._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    const updated = { ...found, ...req.body };
    const [hydrated] = hydratePartner([updated as { partner?: string }]);
    return res.json(hydrated);
  }
  const doc = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('partner', 'name code').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  if (!isDBConnected()) return res.json({ deleted: true });
  const doc = await Project.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ deleted: true });
});

export const projectRoutes = router;
