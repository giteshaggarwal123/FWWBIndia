import { Router } from 'express';
import { Form } from '../models/Form.js';
import { FormSubmission } from '../models/FormSubmission.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_FORMS, DEMO_FORM_SUBMISSIONS } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);

// List forms — viewable by anyone with form-builder, activities, or dashboard (so all staff can see dummy submissions)
router.get('/', requireRole('form-builder', 'activities', 'dashboard'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    return res.json(DEMO_FORMS);
  }
  const q: Record<string, unknown> = { status: 'active' };
  if (req.query.status) q.status = req.query.status;
  const list = await Form.find(q).populate('createdBy', 'name').populate('project', 'name').sort({ createdAt: -1 }).lean();
  if (list.length === 0) return res.json(DEMO_FORMS);
  res.json(list);
});

// Demo: map login username to a name that appears in demo submissions (so "My submissions" shows data)
export const DEMO_USER_TO_SUBMISSION_NAME: Record<string, string> = {
  employee: 'Honey Chauhan',
  'program.user': 'Honey Chauhan',
  admin: 'S.S.Bhat',
  'hr.user': 'Madhavi Desai',
  'admin.user': 'Geetaben Parmar',
  donor: 'S.S.Bhat',
};

// My submissions (current user's submissions across all forms) — for mobile "My submissions" view
router.get('/my-submissions', requireRole('form-builder', 'activities', 'dashboard'), async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!isDBConnected()) {
    const userName = req.user.name ?? '';
    const matchName = DEMO_USER_TO_SUBMISSION_NAME[req.user.username] || userName;
    const out: { _id: string; form: string; formTitle?: string; project?: { _id: string; name: string }; submittedBy: { name: string }; data: Record<string, unknown>; createdAt: string }[] = [];
    for (const [formId, subs] of Object.entries(DEMO_FORM_SUBMISSIONS)) {
      const form = DEMO_FORMS.find((f: { _id: string }) => f._id === formId);
      for (const s of subs) {
        if (s.submittedBy?.name === userName || s.submittedBy?.name === matchName) {
          out.push({
            ...s,
            formTitle: form?.title,
            project: form?.project as { _id: string; name: string } | undefined,
          });
        }
      }
    }
    out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json(out);
  }
  let list = await FormSubmission.find({ submittedBy: req.user.id })
    .populate({ path: 'form', select: 'title project', populate: { path: 'project', select: 'name' } })
    .sort({ createdAt: -1 })
    .lean();
  if (list.length === 0) {
    const userName = req.user.name ?? '';
    const matchName = DEMO_USER_TO_SUBMISSION_NAME[req.user.username] || userName;
    const out: { _id: string; form: string; formTitle?: string; project?: { _id: string; name: string }; submittedBy: { name: string }; data: Record<string, unknown>; createdAt: string }[] = [];
    for (const [formId, subs] of Object.entries(DEMO_FORM_SUBMISSIONS)) {
      const form = DEMO_FORMS.find((f: { _id: string }) => f._id === formId);
      for (const s of subs) {
        if (s.submittedBy?.name === userName || s.submittedBy?.name === matchName) {
          out.push({
            ...s,
            formTitle: form?.title,
            project: form?.project as { _id: string; name: string } | undefined,
          });
        }
      }
    }
    out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json(out);
  }
  const withMeta = list.map((s: { form?: { title?: string; project?: { _id: string; name: string } }; [k: string]: unknown }) => ({
    ...s,
    formTitle: (s.form as { title?: string })?.title,
    project: (s.form as { project?: { _id: string; name: string } })?.project,
  }));
  res.json(withMeta);
});

// Create form (program/management)
router.post('/', requireRole('form-builder'), async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-form-${Date.now()}`, ...req.body, createdBy: { _id: req.user.id, name: req.user.name } };
    return res.status(201).json(synthetic);
  }
  const doc = await Form.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json(doc);
});

// Get one form
router.get('/:id', requireRole('form-builder', 'activities', 'dashboard'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const demo = DEMO_FORMS.find((f: { _id: string }) => f._id === req.params.id);
    if (!demo) return res.status(404).json({ message: 'Not found' });
    return res.json(demo);
  }
  const doc = await Form.findById(req.params.id).populate('createdBy', 'name').populate('project', 'name').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

// Update form
router.patch('/:id', requireRole('form-builder'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    return res.json({ ...req.body, _id: req.params.id });
  }
  const doc = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

// Delete form
router.delete('/:id', requireRole('form-builder'), async (req, res) => {
  if (!isDBConnected()) return res.json({ deleted: true });
  await FormSubmission.deleteMany({ form: req.params.id });
  const doc = await Form.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ deleted: true });
});

// List submissions for a form — viewable by anyone with form-builder, activities, or dashboard
router.get('/:id/submissions', requireRole('form-builder', 'activities', 'dashboard'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const list = DEMO_FORM_SUBMISSIONS[req.params.id] ?? [];
    return res.json(list);
  }
  let list = await FormSubmission.find({ form: req.params.id })
    .populate('submittedBy', 'name username')
    .sort({ createdAt: -1 })
    .lean();
  if (list.length === 0) {
    list = (DEMO_FORM_SUBMISSIONS[req.params.id] ?? []) as typeof list;
  }
  res.json(list);
});

// Submit form (field workers / any authenticated user with activities can submit). Optional lat/lng for geotagging.
router.post('/:id/submit', requireRole('form-builder', 'activities'), async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const form = await Form.findById(req.params.id);
  if (!form) return res.status(404).json({ message: 'Form not found' });
  if (form.status !== 'active') return res.status(400).json({ message: 'Form is not accepting submissions' });
  const { data: bodyData, lat, lng, ...rest } = req.body as { data?: Record<string, unknown>; lat?: number; lng?: number; [k: string]: unknown };
  const data = bodyData ?? rest;
  if (!isDBConnected()) {
    const synthetic = {
      _id: `demo-sub-${Date.now()}`,
      form: req.params.id,
      submittedBy: { _id: req.user.id, name: req.user.name },
      data,
      lat: lat != null ? Number(lat) : undefined,
      lng: lng != null ? Number(lng) : undefined,
    };
    return res.status(201).json(synthetic);
  }
  const doc = await FormSubmission.create({
    form: req.params.id,
    submittedBy: req.user.id,
    data,
    ...(lat != null && !Number.isNaN(Number(lat)) && { lat: Number(lat) }),
    ...(lng != null && !Number.isNaN(Number(lng)) && { lng: Number(lng) }),
  });
  res.status(201).json(doc);
});

export const formRoutes = router;
