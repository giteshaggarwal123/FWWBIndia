import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { FileAttachment } from '../models/FileAttachment.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { isDBConnected } from '../config/db.js';
import { DEMO_FILES } from '../data/suprajaDemo.js';

const router = Router();
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(requireAuth);

/** List documents with optional filter by refModel (Project, Donor) and refId */
router.get('/', requireRole('programs', 'donor-mgmt', 'dashboard', 'reports', 'documents'), async (req: AuthRequest, res) => {
  const refModel = (req.query.refModel as string)?.trim();
  const refId = (req.query.refId as string)?.trim();
  if (!isDBConnected()) {
    let list = [...DEMO_FILES];
    if (refModel) list = list.filter((f) => f.refModel === refModel);
    if (refId) list = list.filter((f) => f.refId === refId);
    return res.json(list);
  }
  const q: Record<string, string> = {};
  if (refModel) q.refModel = refModel;
  if (refId) q.refId = refId;
  try {
    const list = await FileAttachment.find(q).sort({ createdAt: -1 }).limit(500).lean();
    res.json(list.map((f) => ({ _id: f._id.toString(), originalName: f.originalName, mimeType: f.mimeType, size: f.size, refModel: f.refModel, refId: f.refId, documentType: (f as { documentType?: string }).documentType, tags: (f as { tags?: string[] }).tags, createdAt: f.createdAt })));
  } catch {
    res.json([]);
  }
});

router.post('/upload', requireRole('programs', 'donor-mgmt', 'reports', 'documents', 'travel', 'expenses', 'admin-expenses'), upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file || !req.user) return res.status(400).json({ message: 'No file or user' });
  if (!isDBConnected()) {
    const synthetic = { _id: `demo-file-${Date.now()}`, originalName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size, refModel: req.body.refModel, refId: req.body.refId, createdAt: new Date().toISOString() };
    return res.status(201).json(synthetic);
  }
  const doc = await FileAttachment.create({
    originalName: req.file.originalname,
    storedPath: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size,
    refModel: req.body.refModel,
    refId: req.body.refId,
    documentType: req.body.documentType || 'other',
    tags: Array.isArray(req.body.tags) ? req.body.tags : (typeof req.body.tags === 'string' && req.body.tags ? req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
    uploadedBy: req.user.id,
  });
  res.status(201).json(doc);
});

router.get('/:id', async (req: AuthRequest, res) => {
  const doc = await FileAttachment.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  if (!fs.existsSync(doc.storedPath)) return res.status(404).json({ message: 'File not found on disk' });
  res.sendFile(path.resolve(doc.storedPath), { headers: { 'Content-Disposition': `attachment; filename="${doc.originalName}"` } });
});

export const fileRoutes = router;
