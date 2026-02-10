import { Router } from 'express';
import { Employee } from '../models/Employee.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { FWWB_TEAM } from '../data/suprajaDemo.js';

// Map demo/login username to employee so every user has an employee record (no "not linked" message)
const USERNAME_TO_EMPLOYEE_ID: Record<string, string> = {
  admin: 'EMP-001',
  'program.user': 'EMP-006',
  'hr.user': 'EMP-012',
  'admin.user': 'EMP-016',
  employee: 'EMP-006',
  donor: 'EMP-001',
};

/** Resolve current user's employee for use in dashboard/me etc. Always returns an employee when req.user is set. */
export async function getCurrentEmployee(req: AuthRequest): Promise<Record<string, unknown> | null> {
  if (!req.user) return null;
  if (!isDBConnected()) {
    const match = FWWB_TEAM.find((e: { name?: string }) => e.name === req.user!.name);
    if (match) return match as Record<string, unknown>;
    const empId = USERNAME_TO_EMPLOYEE_ID[req.user.username] || 'EMP-001';
    const emp = FWWB_TEAM.find((e: { employeeId?: string }) => e.employeeId === empId) || FWWB_TEAM[0];
    return emp as Record<string, unknown>;
  }
  let emp = await Employee.findOne({ userId: req.user.id }).lean();
  if (!emp) emp = await Employee.findOne({ name: req.user.name }).lean();
  if (!emp) {
    const empId = USERNAME_TO_EMPLOYEE_ID[req.user.username];
    if (empId) emp = await Employee.findOne({ employeeId: empId }).lean();
    if (!emp) emp = await Employee.findOne().lean();
  }
  return (emp || (FWWB_TEAM[0] as Record<string, unknown>)) as Record<string, unknown> | null;
}

const router = Router();
router.use(requireAuth);

// Current user's employee record — always returns an employee so mobile can show attendance/leave without "not linked" message
router.get('/me', async (req: AuthRequest, res) => {
  const emp = await getCurrentEmployee(req);
  if (!emp) return res.status(401).json({ message: 'Not authenticated' });
  res.json(emp);
});

router.use(requireRole('employees', 'recruitment', 'attendance', 'leave', 'performance', 'payroll', 'letters', 'user-mgmt'));

router.get('/', async (req: AuthRequest, res) => {
  const page = Math.max(0, parseInt(String(req.query.page), 10) || 0);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 50));
  const usePagination = req.query.page != null || req.query.limit != null;

  if (!isDBConnected()) {
    let list = [...FWWB_TEAM];
    const dept = (req.query.department as string)?.trim();
    const status = (req.query.status as string)?.trim();
    const search = (req.query.search as string)?.trim().toLowerCase();
    if (dept) list = list.filter((e) => e.department === dept);
    if (status) list = list.filter((e) => e.status === status);
    if (search) list = list.filter((e) => e.name.toLowerCase().includes(search) || e.employeeId.toLowerCase().includes(search) || e.email.toLowerCase().includes(search));
    const total = list.length;
    if (usePagination) list = list.slice(page * limit, page * limit + limit);
    return usePagination ? res.json({ data: list, total }) : res.json(list);
  }
  const dept = (req.query.department as string)?.trim();
  const status = (req.query.status as string)?.trim();
  const search = (req.query.search as string)?.trim().toLowerCase();
  const q: Record<string, unknown> = {};
  if (dept) q.department = dept;
  if (status) q.status = status;
  if (search) q.$or = [{ name: new RegExp(search, 'i') }, { employeeId: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  if (usePagination) {
    const [data, total] = await Promise.all([
      Employee.find(q).sort({ createdAt: -1 }).populate('reportingTo', 'name employeeId').skip(page * limit).limit(limit).lean(),
      Employee.countDocuments(q),
    ]);
    if (data.length === 0 && total === 0) {
      let fallback = [...FWWB_TEAM] as typeof data;
      if (dept) fallback = fallback.filter((e) => e.department === dept);
      if (status) fallback = fallback.filter((e) => e.status === status);
      if (search) fallback = fallback.filter((e) => e.name.toLowerCase().includes(search) || e.employeeId.toLowerCase().includes(search) || (e.email && e.email.toLowerCase().includes(search)));
      return res.json({ data: fallback.slice(page * limit, page * limit + limit), total: fallback.length });
    }
    return res.json({ data, total });
  }
  let list = await Employee.find(q).sort({ createdAt: -1 }).populate('reportingTo', 'name employeeId').lean();
  if (list.length === 0) {
    list = [...FWWB_TEAM] as typeof list;
    if (dept) list = list.filter((e) => e.department === dept);
    if (status) list = list.filter((e) => e.status === status);
    if (search) list = list.filter((e) => e.name.toLowerCase().includes(search) || e.employeeId.toLowerCase().includes(search) || (e.email && e.email.toLowerCase().includes(search)));
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, status: req.body.status || 'active' };
    return res.status(201).json(synthetic);
  }
  const doc = await Employee.create(req.body);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = FWWB_TEAM.find((e: { _id: string }) => e._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await Employee.findById(req.params.id).populate('reportingTo', 'name employeeId').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = FWWB_TEAM.find((e: { _id: string }) => e._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  if (!isDBConnected()) return res.json({ deleted: true });
  const doc = await Employee.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ deleted: true });
});

export const employeeRoutes = router;
