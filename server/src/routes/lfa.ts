import { Router } from 'express';
import { LFA } from '../models/LFA.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_LFA } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('lfa', 'programs', 'activities', 'monitoring', 'reports'));

// In-memory store for demo LFA edits (keyed by projectId)
const demoLfaStore: Record<string, { project: string; goal: string; objectives: unknown[] }> = {};

router.get('/project/:projectId', async (req: AuthRequest, res) => {
  const { projectId } = req.params;
  if (!isDBConnected()) {
    const stored = demoLfaStore[projectId];
    const doc = stored ?? (projectId === DEMO_LFA.project ? { ...DEMO_LFA, _id: 'demo-lfa' } : null);
    if (!doc) return res.status(404).json({ message: 'LFA not found for this project' });
    return res.json(doc);
  }
  const doc = await LFA.findOne({ project: projectId }).lean();
  if (!doc) return res.status(404).json({ message: 'LFA not found for this project' });
  res.json(doc);
});

router.put('/project/:projectId', async (req: AuthRequest, res) => {
  const { projectId } = req.params;
  const { goal, objectives } = req.body;
  if (!isDBConnected()) {
    demoLfaStore[projectId] = { project: projectId, goal: goal ?? '', objectives: Array.isArray(objectives) ? objectives : [] };
    return res.json({ _id: 'demo-lfa', ...demoLfaStore[projectId] });
  }
  const doc = await LFA.findOneAndUpdate(
    { project: projectId },
    { goal: goal || '', objectives: objectives || [] },
    { new: true, upsert: true }
  ).lean();
  res.json(doc);
});

router.post('/project/:projectId', async (req: AuthRequest, res) => {
  const { projectId } = req.params;
  if (!isDBConnected()) {
    demoLfaStore[projectId] = {
      project: projectId,
      goal: req.body.goal ?? '',
      objectives: Array.isArray(req.body.objectives) ? req.body.objectives : [],
    };
    return res.status(201).json({ _id: 'demo-lfa', ...demoLfaStore[projectId] });
  }
  const doc = await LFA.create({
    project: projectId,
    goal: req.body.goal || '',
    objectives: req.body.objectives || [],
  });
  res.status(201).json(doc);
});

export const lfaRoutes = router;
