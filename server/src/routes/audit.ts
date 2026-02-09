import { Router } from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { isDBConnected } from '../config/db.js';
import type { AuthRequest } from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('user-mgmt', 'audit'));

const demoAuditStore: { _id: string; action: string; userId: string; userName?: string; entityType?: string; entityId?: string; details?: string; createdAt: string }[] = [
  { _id: 'demo-audit-1', action: 'project.create', userId: 'demo-admin', userName: 'Admin User', entityType: 'Project', entityId: 'demo-supraja-project', details: 'Supraja Foundation - FPO Development', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'demo-audit-2', action: 'donor.create', userId: 'demo-admin', userName: 'Admin User', entityType: 'Donor', entityId: 'donor1', details: 'FWWB / Donor', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'demo-audit-3', action: 'user.login', userId: 'demo-program', userName: 'Program User', entityType: 'Auth', details: 'program.user', createdAt: new Date().toISOString() },
];
let demoId = 4;

export function recordAudit(req: AuthRequest | null, action: string, entityType?: string, entityId?: string, details?: string) {
  const userId = req?.user?.id ?? 'system';
  const userName = req?.user?.name;
  const entry = { _id: `demo-audit-${demoId++}`, action, userId, userName, entityType, entityId, details, createdAt: new Date().toISOString() };
  demoAuditStore.unshift(entry);
  if (demoAuditStore.length > 200) demoAuditStore.pop();
  if (isDBConnected()) {
    AuditLog.create({ action, userId, userName, entityType, entityId, details }).catch(() => {});
  }
}

router.get('/', async (_req: AuthRequest, res) => {
  if (!isDBConnected()) {
    return res.json(demoAuditStore.slice(0, 100));
  }
  const list = await AuditLog.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json(list);
});

router.get('/export', async (req: AuthRequest, res) => {
  const format = (req.query.format as string) || 'csv';
  if (!isDBConnected()) {
    const rows = demoAuditStore.slice(0, 500);
    if (format === 'csv') {
      const header = 'Date,Action,User,Entity Type,Entity ID,Details\n';
      const lines = rows.map((r) => `${r.createdAt},${r.action},${r.userName || r.userId},${r.entityType || ''},${r.entityId || ''},${(r.details || '').replace(/,/g, ';')}`);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-log.csv');
      return res.send(header + lines.join('\n'));
    }
    return res.json(rows);
  }
  const list = await AuditLog.find().sort({ createdAt: -1 }).limit(5000).lean();
  if (format === 'csv') {
    const header = 'Date,Action,User,Entity Type,Entity ID,Details\n';
    const lines = list.map((r) => {
      const createdAt = (r as { createdAt?: Date }).createdAt ? new Date((r as { createdAt: Date }).createdAt).toISOString() : '';
      const userName = (r as { userName?: string }).userName || (r as { userId?: string }).userId || '';
      return `${createdAt},${(r as { action?: string }).action},${userName},${(r as { entityType?: string }).entityType || ''},${(r as { entityId?: string }).entityId || ''},${((r as { details?: string }).details || '').replace(/,/g, ';')}`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-log.csv');
    return res.send(header + lines.join('\n'));
  }
  res.json(list);
});

export const auditRoutes = router;
