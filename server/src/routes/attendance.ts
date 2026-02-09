import { Router } from 'express';
import { Attendance } from '../models/Attendance.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_ATTENDANCE } from '../data/suprajaDemo.js';
import { getCurrentEmployee } from './employees.js';

/** In-memory store for attendance marked in demo mode (so check-in/check-out from mobile persists for the session) */
const demoAttendanceStore: Array<Record<string, unknown>> = [];

function getDemoList(req: AuthRequest): Record<string, unknown>[] {
  const combined = [...DEMO_ATTENDANCE, ...demoAttendanceStore] as Record<string, unknown>[];
  let list = combined;
  const empId = (req.query.employee as string)?.trim();
  const dateQ = (req.query.date as string)?.trim();
  if (empId) {
    list = list.filter((a) => {
      const e = a.employee;
      const id = e && typeof e === 'object' && '_id' in e ? (e as { _id: string })._id : String(e);
      return id === empId;
    });
  }
  if (dateQ) {
    const norm = dateQ.slice(0, 10);
    list = list.filter((a) => {
      const d = a.date;
      const dStr = d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? '').slice(0, 10);
      return dStr === norm;
    });
  }
  if (req.query.status) {
    list = list.filter((a: Record<string, unknown>) => a.status === req.query.status);
  }
  return list.sort((a, b) => {
    const da = a.date ? new Date(a.date as string).getTime() : 0;
    const db = b.date ? new Date(b.date as string).getTime() : 0;
    return db - da;
  });
}

const router = Router();
router.use(requireAuth);
router.use(requireRole('attendance'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    return res.json(getDemoList(req));
  }
  const q: Record<string, unknown> = {};
  if (req.query.employee) q.employee = req.query.employee;
  if (req.query.date) q.date = { $gte: new Date(req.query.date as string), $lt: new Date(new Date(req.query.date as string).getTime() + 86400000) };
  if (req.query.status) q.status = req.query.status;
  let list = await Attendance.find(q).populate('employee', 'name employeeId').sort({ date: -1 }).lean();
  if (list.length === 0) {
    list = [...DEMO_ATTENDANCE] as typeof list;
    if (req.query.status) list = list.filter((a: { status: string }) => a.status === req.query.status);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const emp = await getCurrentEmployee(req);
    const empId = (req.body.employee as string) || (emp && (emp._id as string));
    const employeeObj = (emp && typeof emp === 'object')
      ? { _id: empId, name: (emp.name as string) ?? req.user?.name, employeeId: emp.employeeId }
      : { _id: empId, name: req.user?.name ?? 'User', employeeId: '' };
    const dateStr = req.body.date ? String(req.body.date).slice(0, 10) : new Date().toISOString().slice(0, 10);
    const synthetic = {
      _id: `demo-${Date.now()}`,
      employee: employeeObj,
      date: dateStr,
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut,
      status: req.body.status ?? 'present',
      notes: req.body.notes ?? '',
      lat: req.body.lat,
      lng: req.body.lng,
      checkOutLat: req.body.checkOutLat,
      checkOutLng: req.body.checkOutLng,
    };
    demoAttendanceStore.push(synthetic);
    return res.status(201).json(synthetic);
  }
  const doc = await Attendance.create(req.body);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const fromStore = demoAttendanceStore.find((a) => a._id === req.params.id);
    if (fromStore) return res.json(fromStore);
    const doc = DEMO_ATTENDANCE.find((a: { _id: string }) => a._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await Attendance.findById(req.params.id).populate('employee').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    if (String(req.params.id).startsWith('demo-')) {
      const rec = demoAttendanceStore.find((a) => a._id === req.params.id);
      if (!rec) return res.status(404).json({ message: 'Not found' });
      if (req.body.checkOut != null) rec.checkOut = req.body.checkOut;
      if (req.body.checkOutLat != null) rec.checkOutLat = req.body.checkOutLat;
      if (req.body.checkOutLng != null) rec.checkOutLng = req.body.checkOutLng;
      if (req.body.status != null) rec.status = req.body.status;
      if (req.body.notes != null) rec.notes = req.body.notes;
      return res.json(rec);
    }
    const found = DEMO_ATTENDANCE.find((a: { _id: string }) => a._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

export const attendanceRoutes = router;
