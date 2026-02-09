import { Router } from 'express';
import { TravelRequest } from '../models/TravelRequest.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_TRAVEL } from '../data/suprajaDemo.js';
import { canApproveTravel } from '../config/approvalMatrix.js';
import type { RoleType } from '../config/roles.js';
import { recordAudit } from './audit.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('travel'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...DEMO_TRAVEL];
    if (req.query.status) list = list.filter((t: { status: string }) => t.status === req.query.status);
    if (req.query.mode) list = list.filter((t: { mode: string }) => t.mode === req.query.mode);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.status) q.status = req.query.status;
  if (req.query.mode) q.mode = req.query.mode;
  let list = await TravelRequest.find(q).populate('employee', 'name employeeId').sort({ travelDate: -1 }).lean();
  if (list.length === 0) {
    list = [...DEMO_TRAVEL] as typeof list;
    if (req.query.status) list = list.filter((t: { status: string }) => t.status === req.query.status);
    if (req.query.mode) list = list.filter((t: { mode: string }) => t.mode === req.query.mode);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, requestId: req.body.requestId || `TR-${Date.now()}`, ...req.body, status: req.body.status || 'pending' };
    return res.status(201).json(synthetic);
  }
  const doc = await TravelRequest.create(req.body);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_TRAVEL.find((t: { _id: string }) => t._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await TravelRequest.findById(req.params.id).populate('employee').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const newStatus = req.body.status as string | undefined;
  const roleType = req.user?.type as RoleType | undefined;
  if (newStatus === 'approved' || newStatus === 'rejected') {
    if (!roleType || !canApproveTravel(roleType)) {
      return res.status(403).json({ message: 'You do not have permission to approve or reject travel requests' });
    }
    if (req.user) {
      (req.body as Record<string, unknown>).approvedBy = req.user.id;
      recordAudit(req, `travel.${newStatus}`, 'TravelRequest', req.params.id, '');
    }
  }
  if (!isDBConnected()) {
    const found = DEMO_TRAVEL.find((t: { _id: string }) => t._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await TravelRequest.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('approvedBy', 'name')
    .lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

export const travelRoutes = router;
