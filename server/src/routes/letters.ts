import { Router } from 'express';
import { LetterTemplate, LetterInstance } from '../models/LetterTemplate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_LETTER_TEMPLATES, DEMO_LETTER_INSTANCES } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('letters'));

router.get('/templates', async (_req: AuthRequest, res) => {
  if (!isDBConnected()) return res.json(DEMO_LETTER_TEMPLATES);
  let list = await LetterTemplate.find().sort({ updatedAt: -1 }).lean();
  if (list.length === 0) list = DEMO_LETTER_TEMPLATES as typeof list;
  res.json(list);
});

router.post('/templates', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, usageCount: 0 };
    return res.status(201).json(synthetic);
  }
  const doc = await LetterTemplate.create(req.body);
  res.status(201).json(doc);
});

router.get('/templates/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_LETTER_TEMPLATES.find((t: { _id: string }) => t._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await LetterTemplate.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

/** Download template as plain text (viewable content) */
router.get('/templates/:id/download', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_LETTER_TEMPLATES.find((t: { _id: string }) => t._id === req.params.id) as { name?: string; body?: string } | undefined;
    if (!doc) return res.status(404).json({ message: 'Not found' });
    const name = (doc.name || 'template').replace(/[^a-zA-Z0-9.-]/g, '_');
    const body = doc.body || '(No content)';
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${name}.txt"`);
    return res.send(body);
  }
  const doc = await LetterTemplate.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  const name = ((doc as { name?: string }).name || 'template').replace(/[^a-zA-Z0-9.-]/g, '_');
  const body = (doc as { body?: string }).body || '(No content)';
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${name}.txt"`);
  res.send(body);
});

router.patch('/templates/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = DEMO_LETTER_TEMPLATES.find((t: { _id: string }) => t._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await LetterTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.get('/generated', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    let list = [...DEMO_LETTER_INSTANCES];
    if (req.query.status) list = list.filter((l: { status: string }) => l.status === req.query.status);
    return res.json(list);
  }
  const q: Record<string, unknown> = {};
  if (req.query.status) q.status = req.query.status;
  let list = await LetterInstance.find(q)
    .populate('template', 'name category')
    .populate('employee', 'name employeeId')
    .populate('generatedBy', 'name')
    .sort({ createdAt: -1 })
    .lean();
  if (list.length === 0) {
    list = [...DEMO_LETTER_INSTANCES] as typeof list;
    if (req.query.status) list = list.filter((l: { status: string }) => l.status === req.query.status);
  }
  res.json(list);
});

router.post('/generated', async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-${Date.now()}`, ...req.body, generatedBy: { name: req.user.name }, status: req.body.status || 'pending' };
    return res.status(201).json(synthetic);
  }
  const doc = await LetterInstance.create({ ...req.body, generatedBy: req.user.id });
  res.status(201).json(doc);
});

router.get('/generated/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const doc = DEMO_LETTER_INSTANCES.find((l: { _id: string }) => l._id === req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const doc = await LetterInstance.findById(req.params.id).populate('template').populate('employee').populate('generatedBy').lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

router.patch('/generated/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const found = DEMO_LETTER_INSTANCES.find((l: { _id: string }) => l._id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...found, ...req.body });
  }
  const doc = await LetterInstance.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('template', 'name category')
    .populate('employee', 'name employeeId')
    .populate('generatedBy', 'name')
    .lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

/** Render generated letter content (template body with placeholders replaced) */
function renderLetterBody(
  body: string,
  letterId: string,
  letterType: string,
  employeeName: string,
  employeeId: string,
  generatedByName: string,
  date: string
): string {
  let out = body || 'No content.';
  const vars: Record<string, string> = {
    '{{letterId}}': letterId,
    '{{letter_id}}': letterId,
    '{{letterType}}': letterType,
    '{{letter_type}}': letterType,
    '{{employeeName}}': employeeName,
    '{{employee_name}}': employeeName,
    '{{employeeId}}': employeeId,
    '{{employee_id}}': employeeId,
    '{{generatedBy}}': generatedByName,
    '{{date}}': date,
    '{{generatedDate}}': date,
  };
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(k).join(v);
  }
  return out;
}

/** Get rendered letter content for viewing (JSON) */
router.get('/generated/:id/view', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const inst = DEMO_LETTER_INSTANCES.find((l: { _id: string }) => l._id === req.params.id) as {
      letterId?: string; letterType?: string; template?: { _id?: string }; employee?: { name?: string; employeeId?: string }; generatedBy?: { name?: string }; createdAt?: string;
    } | undefined;
    if (!inst) return res.status(404).json({ message: 'Not found' });
    const template = DEMO_LETTER_TEMPLATES.find((t: { _id: string }) => t._id === (inst.template as { _id?: string })?._id) as { body?: string } | undefined;
    const body = template?.body || `Letter: ${inst.letterId}\nType: ${inst.letterType}\nEmployee: ${(inst.employee as { name?: string })?.name}\n\n(No template content.)`;
    const rendered = renderLetterBody(
      body,
      inst.letterId || '',
      inst.letterType || '',
      (inst.employee as { name?: string })?.name || '',
      (inst.employee as { employeeId?: string })?.employeeId || '',
      (inst.generatedBy as { name?: string })?.name || '',
      inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
    );
    return res.json({ content: rendered });
  }
  const doc = await LetterInstance.findById(req.params.id)
    .populate('template')
    .populate('employee', 'name employeeId')
    .populate('generatedBy', 'name')
    .lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  const t = doc.template as { name?: string; body?: string } | null;
  const emp = doc.employee as { name?: string; employeeId?: string } | null;
  const gen = doc.generatedBy as { name?: string } | null;
  const body = t?.body || `Letter: ${(doc as { letterId?: string }).letterId}\nType: ${(doc as { letterType?: string }).letterType}\nEmployee: ${emp?.name}\n\n(No template content.)`;
  const rendered = renderLetterBody(
    body,
    (doc as { letterId?: string }).letterId || '',
    (doc as { letterType?: string }).letterType || '',
    emp?.name || '',
    emp?.employeeId || '',
    gen?.name || '',
    (doc as { createdAt?: Date }).createdAt ? new Date((doc as { createdAt: Date }).createdAt).toLocaleDateString() : new Date().toLocaleDateString()
  );
  res.json({ content: rendered });
});

/** Download generated letter as plain text */
router.get('/generated/:id/download', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const inst = DEMO_LETTER_INSTANCES.find((l: { _id: string }) => l._id === req.params.id) as {
      letterId?: string; letterType?: string; template?: { name?: string }; employee?: { name?: string; employeeId?: string }; generatedBy?: { name?: string }; createdAt?: string;
    } | undefined;
    if (!inst) return res.status(404).json({ message: 'Not found' });
    const template = DEMO_LETTER_TEMPLATES.find((t: { _id: string }) => t._id === (inst.template as { _id?: string })?._id) as { body?: string } | undefined;
    const body = template?.body || `Letter: ${inst.letterId}\nType: ${inst.letterType}\nEmployee: ${(inst.employee as { name?: string })?.name}\n\n(No template content.)`;
    const rendered = renderLetterBody(
      body,
      inst.letterId || '',
      inst.letterType || '',
      (inst.employee as { name?: string })?.name || '',
      (inst.employee as { employeeId?: string })?.employeeId || '',
      (inst.generatedBy as { name?: string })?.name || '',
      inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
    );
    const filename = `Letter_${(inst.letterId || 'export').replace(/[^a-zA-Z0-9.-]/g, '_')}.txt`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(rendered);
  }
  const doc = await LetterInstance.findById(req.params.id)
    .populate('template')
    .populate('employee', 'name employeeId')
    .populate('generatedBy', 'name')
    .lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  const t = doc.template as { name?: string; body?: string } | null;
  const emp = doc.employee as { name?: string; employeeId?: string } | null;
  const gen = doc.generatedBy as { name?: string } | null;
  const body = t?.body || `Letter: ${(doc as { letterId?: string }).letterId}\nType: ${(doc as { letterType?: string }).letterType}\nEmployee: ${emp?.name}\n\n(No template content.)`;
  const rendered = renderLetterBody(
    body,
    (doc as { letterId?: string }).letterId || '',
    (doc as { letterType?: string }).letterType || '',
    emp?.name || '',
    emp?.employeeId || '',
    gen?.name || '',
    (doc as { createdAt?: Date }).createdAt ? new Date((doc as { createdAt: Date }).createdAt).toLocaleDateString() : new Date().toLocaleDateString()
  );
  const letterId = (doc as { letterId?: string }).letterId || 'export';
  const filename = `Letter_${letterId.replace(/[^a-zA-Z0-9.-]/g, '_')}.txt`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(rendered);
});

export const letterRoutes = router;
