import { Router } from 'express';
import { MonitoringEntry } from '../models/MonitoringEntry.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_MONITORING } from '../data/suprajaDemo.js';
import type { AuthRequest } from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('monitoring'));

const demoMonitoringStore: { _id: string; entryId: string; project: unknown; activity?: unknown; location?: string; date: string; notes?: string; expectedParticipants?: number; actualParticipants?: number; collectedBy: unknown }[] = [];

function getDemoMonitoringList(projectFilter?: string) {
  const list = [...DEMO_MONITORING, ...demoMonitoringStore];
  if (projectFilter) return list.filter((e) => (e.project as { _id?: string })?._id === projectFilter);
  return list;
}

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const project = (req.query.project as string)?.trim();
    return res.json(getDemoMonitoringList(project));
  }
  const q: Record<string, unknown> = {};
  if (req.query.project) q.project = req.query.project;
  let list = await MonitoringEntry.find(q)
    .populate('project', 'name')
    .populate('collectedBy', 'name username')
    .sort({ date: -1 })
    .lean();
  if (list.length === 0) {
    list = [...DEMO_MONITORING] as typeof list;
    const project = (req.query.project as string)?.trim();
    if (project) list = list.filter((e) => (e.project as { _id?: string })?._id === project);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!isDBConnected()) {
    const id = `demo-${Date.now()}`;
    const synthetic = { _id: id, entryId: req.body.entryId || `MON-${Date.now()}`, project: req.body.project, activity: req.body.activity, location: req.body.location, date: req.body.date || new Date().toISOString(), notes: req.body.notes || '', expectedParticipants: req.body.expectedParticipants, actualParticipants: req.body.actualParticipants, collectedBy: { name: req.user.name } };
    demoMonitoringStore.push(synthetic);
    return res.status(201).json(synthetic);
  }
  const doc = await MonitoringEntry.create({ ...req.body, collectedBy: req.user.id });
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = getDemoMonitoringList().find((m: { _id: string }) => m._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await MonitoringEntry.findById(req.params.id).populate('project').populate('collectedBy').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const idx = demoMonitoringStore.findIndex((m) => m._id === req.params.id);
    const found = idx >= 0 ? demoMonitoringStore[idx] : (DEMO_MONITORING as { _id: string }[]).find((m) => m._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    if (idx >= 0) Object.assign(demoMonitoringStore[idx], req.body);
    return res.json({ ...found, ...req.body });
  }
  const doc = await MonitoringEntry.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  if (!isDBConnected()) return res.json({ deleted: true });
  const doc = await MonitoringEntry.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ deleted: true });
});

export const monitoringRoutes = router;
