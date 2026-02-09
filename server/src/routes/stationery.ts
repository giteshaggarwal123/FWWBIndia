import { Router } from 'express';
import { StationeryRequest } from '../models/StationeryRequest.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_STATIONERY } from '../data/suprajaDemo.js';
import { canApproveStationery } from '../config/approvalMatrix.js';
import type { RoleType } from '../config/roles.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('stationery'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...DEMO_STATIONERY];
    if (req.query.status) list = list.filter((s: { status: string }) => s.status === req.query.status);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.status) q.status = req.query.status;
  let list = await StationeryRequest.find(q).populate('requestedBy', 'name username').sort({ date: -1 }).lean();
  if (list.length === 0) {
    list = [...DEMO_STATIONERY] as typeof list;
    if (req.query.status) list = list.filter((s: { status: string }) => s.status === req.query.status);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, requestId: req.body.requestId || `ST-${Date.now()}`, ...req.body, requestedBy: { name: req.user.name, username: req.user.username }, status: 'pending' };
    return res.status(201).json(synthetic);
  }
  const doc = await StationeryRequest.create({ ...req.body, requestedBy: req.user.id });
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_STATIONERY.find((s: { _id: string }) => s._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await StationeryRequest.findById(req.params.id).populate('requestedBy').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const newStatus = req.body.status as string | undefined;
  const roleType = req.user?.type as RoleType | undefined;
  if (newStatus === 'approved' || newStatus === 'rejected' || newStatus === 'fulfilled') {
    if (newStatus !== 'fulfilled' && (newStatus === 'approved' || newStatus === 'rejected')) {
      if (!roleType || !canApproveStationery(roleType)) {
        return res.status(403).json({ message: 'You do not have permission to approve or reject stationery requests' });
      }
    }
  }
  if (!isDBConnected()) {
    const found = DEMO_STATIONERY.find((s: { _id: string }) => s._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await StationeryRequest.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

export const stationeryRoutes = router;
