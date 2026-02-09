import { Router } from 'express';
import { CalendarEvent } from '../models/CalendarEvent.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_CALENDAR } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('calendar', 'engagement'));

router.get('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...DEMO_CALENDAR];
    if (req.query.type) list = list.filter((c: { type: string }) => c.type === req.query.type);
    if (req.query.from || req.query.to) {
      const from = req.query.from ? new Date(req.query.from as string) : null;
      const to = req.query.to ? new Date(req.query.to as string) : null;
      list = list.filter((c: { date: string }) => {
        const d = new Date(c.date);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }
    list.sort((a: { date: string }, b: { date: string }) => (a.date < b.date ? -1 : 1));
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.type) q.type = req.query.type;
  if (req.query.from || req.query.to) {
    q.date = {};
    if (req.query.from) (q.date as Record<string, Date>).$gte = new Date(req.query.from as string);
    if (req.query.to) (q.date as Record<string, Date>).$lte = new Date(req.query.to as string);
  }
  let list = await CalendarEvent.find(q).sort({ date: 1 }).lean();
  if (list.length === 0) {
    list = [...DEMO_CALENDAR] as typeof list;
    if (req.query.type) list = list.filter((c: { type: string }) => c.type === req.query.type);
  }
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, status: req.body.status || 'confirmed' };
    return res.status(201).json(synthetic);
  }
  const doc = await CalendarEvent.create(req.body);
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_CALENDAR.find((c: { _id: string }) => c._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await CalendarEvent.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = DEMO_CALENDAR.find((c: { _id: string }) => c._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  if (!isDBConnected()) return res.json({ deleted: true });
  const doc = await CalendarEvent.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ deleted: true });
});

export const calendarRoutes = router;
