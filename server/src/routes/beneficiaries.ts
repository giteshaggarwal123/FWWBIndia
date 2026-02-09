import { Router } from 'express';
import { Beneficiary } from '../models/Beneficiary.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_BENEFICIARIES, DEMO_PROJECTS } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('programs', 'activities', 'reports'));

const demoBeneficiaryStore: Record<string, { _id: string; project: string; type: string; count: number; category?: string; location?: string; period?: string; notes?: string; recordedAt: string }> = {};

function hydrateProject(list: { project: string | { _id: string; name?: string } }[]) {
  return list.map((b) => {
    const pid = typeof b.project === 'string' ? b.project : (b.project as { _id: string })?._id;
    const proj = DEMO_PROJECTS.find((p: { _id: string }) => p._id === pid);
    return { ...b, project: proj ? { _id: proj._id, name: (proj as { name?: string }).name } : b.project };
  });
}

router.get('/', async (req: AuthRequest, res) => {
  const project = (req.query.project as string)?.trim();
  if (!isDBConnected()) {
    const fromStore = Object.values(demoBeneficiaryStore);
    let list = [...(DEMO_BENEFICIARIES as { _id: string; project: { _id: string }; type: string; count: number }[]), ...fromStore.map((s) => ({ ...s, project: { _id: s.project, name: '' } }))];
    if (project) list = list.filter((b) => ((b.project as { _id?: string })?._id || (b.project as string)) === project);
    return res.json(hydrateProject(list as { project: string | { _id: string } }[]));
  }
  const q: Record<string, unknown> = {};
  if (project) q.project = project;
  let list = await Beneficiary.find(q).populate('project', 'name').populate('activity', 'name').sort({ recordedAt: -1 }).lean();
  if (list.length === 0) {
    list = hydrateProject((DEMO_BENEFICIARIES as unknown[]) as { project: string }[]) as typeof list;
    if (project) list = list.filter((b) => (b.project as { _id?: string })?._id === project);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const id = `demo-${Date.now()}`;
    const synthetic = { _id: id, project: req.body.project, type: req.body.type || 'individual', count: req.body.count ?? 0, category: req.body.category, location: req.body.location, period: req.body.period, notes: req.body.notes, recordedAt: req.body.recordedAt || new Date().toISOString() };
    demoBeneficiaryStore[id] = synthetic;
    const [hydrated] = hydrateProject([{ ...synthetic, project: synthetic.project }]);
    return res.status(201).json(hydrated);
  }
  const doc = await Beneficiary.create(req.body);
  const populated = await Beneficiary.findById(doc._id).populate('project', 'name').populate('activity', 'name').lean();
  res.status(201).json(populated);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const fromStore = demoBeneficiaryStore[req.params.id];
    const fromDemo = (DEMO_BENEFICIARIES as { _id: string }[]).find((b) => b._id === req.params.id);
    const doc = fromStore ? { ...fromStore, project: { _id: fromStore.project, name: (DEMO_PROJECTS.find((p: { _id: string }) => p._id === fromStore.project) as { name?: string })?.name } } : fromDemo;
    if (!doc) return res.status(404).json({ message: 'Not found' });
    const [hydrated] = hydrateProject([doc as { project: string }]);
    return res.json(hydrated[0] || doc);
  }
  const doc = await Beneficiary.findById(req.params.id).populate('project', 'name').populate('activity', 'name').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const existing = demoBeneficiaryStore[req.params.id] ?? (DEMO_BENEFICIARIES as { _id: string }[]).find((b) => b._id === req.params.id);
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const updated = { ...existing, ...req.body };
    if (demoBeneficiaryStore[req.params.id]) demoBeneficiaryStore[req.params.id] = { ...demoBeneficiaryStore[req.params.id], ...req.body };
    const [hydrated] = hydrateProject([updated as { project: string }]);
    return res.json(hydrated[0] || updated);
  }
  const doc = await Beneficiary.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('project', 'name').populate('activity', 'name').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    if (demoBeneficiaryStore[req.params.id]) delete demoBeneficiaryStore[req.params.id];
    return res.json({ deleted: true });
  }
  const doc = await Beneficiary.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ deleted: true });
});

export const beneficiaryRoutes = router;
