import { Router } from 'express';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_LEAVE } from '../data/suprajaDemo.js';
import { canApproveLeave } from '../config/approvalMatrix.js';
import type { RoleType } from '../config/roles.js';
import { recordAudit } from './audit.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('leave'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...DEMO_LEAVE];
    if (req.query.status) list = list.filter((l: { status: string }) => l.status === req.query.status);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.employee) q.employee = req.query.employee;
  if (req.query.status) q.status = req.query.status;
  let list = await LeaveRequest.find(q).populate('employee', 'name employeeId').populate('approvedBy', 'name').sort({ fromDate: -1 }).lean();
  if (list.length === 0) {
    list = [...DEMO_LEAVE] as typeof list;
    if (req.query.status) list = list.filter((l: { status: string }) => l.status === req.query.status);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, status: 'pending' };
    return res.status(201).json(synthetic);
  }
  const doc = await LeaveRequest.create(req.body);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_LEAVE.find((l: { _id: string }) => l._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await LeaveRequest.findById(req.params.id).populate('employee').populate('approvedBy').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const newStatus = req.body.status as string | undefined;
  const roleType = req.user?.type as RoleType | undefined;
  if (newStatus === 'approved' || newStatus === 'rejected') {
    if (!roleType || !canApproveLeave(roleType)) {
      return res.status(403).json({ message: 'You do not have permission to approve or reject leave requests' });
    }
  }
  if (!isDBConnected()) {
    const found = DEMO_LEAVE.find((l: { _id: string }) => l._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    const updated = { ...found, ...req.body };
    if (newStatus === 'approved' || newStatus === 'rejected') {
      if (req.user) (updated as Record<string, unknown>).approvedBy = { name: req.user.name };
    }
    return res.json(updated);
  }
  if ((newStatus === 'approved' || newStatus === 'rejected') && req.user) {
    (req.body as Record<string, unknown>).approvedBy = req.user.id;
    recordAudit(req, `leave.${newStatus}`, 'LeaveRequest', req.params.id, newStatus);
  }
  const doc = await LeaveRequest.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('approvedBy', 'name').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

export const leaveRoutes = router;
