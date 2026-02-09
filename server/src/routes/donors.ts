import { Router } from 'express';
import { Donor } from '../models/Donor.js';
import { Project } from '../models/Project.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_DONORS } from '../data/suprajaDemo.js';
import { recordAudit } from './audit.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('donor-mgmt', 'donor-portal', 'programs', 'dashboard'));

/** List donors. When DB connected, optionally count programs per donor. */
router.get('/', async (_req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const { DEMO_PROJECTS } = await import('../data/suprajaDemo.js');
    const countByDonor: Record<string, number> = {};
    for (const p of DEMO_PROJECTS as { donor?: string }[]) {
      const d = (p.donor || '').trim();
      if (d) countByDonor[d] = (countByDonor[d] || 0) + 1;
    }
    const withCount = DEMO_DONORS.map((d) => ({
      ...d,
      programCount: countByDonor[(d as { name?: string }).name || ''] ?? 0,
    }));
    return res.json(withCount);
  }
  let list = await Donor.find().sort({ name: 1 }).lean();
  if (list.length === 0) list = DEMO_DONORS as typeof list;
  const projects = await Project.find().select('donor').lean();
  const countByDonor: Record<string, number> = {};
  for (const p of projects) {
    const d = (p.donor || '').trim();
    if (d) countByDonor[d] = (countByDonor[d] || 0) + 1;
  }
  const withCount = list.map((d) => ({
    ...d,
    programCount: countByDonor[(d as { name?: string }).name || ''] ?? countByDonor[(d as { code?: string }).code || ''] ?? 0,
  }));
  res.json(withCount);
});

router.post('/', requireRole('donor-mgmt', 'programs'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-donor-${Date.now()}`, ...req.body, status: req.body.status || 'active' };
    return res.status(201).json(synthetic);
  }
  const doc = await Donor.create(req.body);
  recordAudit(req, 'donor.create', 'Donor', doc._id.toString(), doc.name);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_DONORS.find((d: { _id: string }) => d._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await Donor.findById(req.params.id).populate('agreementAttachmentId', 'originalName').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', requireRole('donor-mgmt', 'programs'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = DEMO_DONORS.find((d: { _id: string }) => d._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await Donor.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('agreementAttachmentId', 'originalName').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.delete('/:id', requireRole('donor-mgmt', 'programs'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) return res.json({ deleted: true });
  const doc = await Donor.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ deleted: true });
});

export const donorRoutes = router;
