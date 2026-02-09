import { Router } from 'express';
import XLSX from 'xlsx';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { Activity } from '../models/Activity.js';
import { Expense } from '../models/Expense.js';
import { Project } from '../models/Project.js';
import type { AuthRequest } from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);

router.post('/activities', requireRole('activities'), async (req: AuthRequest, res) => {
  if (!req.body.sheet || !Array.isArray(req.body.rows)) {
    return res.status(400).json({ message: 'Send { projectId, rows: [{ activityId, name, budget, ... }] }' });
  }
  const { projectId, rows } = req.body;
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const created = await Activity.insertMany(
    rows.map((r: Record<string, unknown>) => ({
      activityId: r.activityId || r.activity_id || `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: r.name || r.activity_name || 'Unnamed',
      project: projectId,
      budget: Number(r.budget) || 0,
      startDate: r.startDate || r.start_date,
      endDate: r.endDate || r.end_date,
      status: r.status || 'planned',
      quarter: r.quarter,
      location: r.location,
      expectedParticipants: r.expectedParticipants ?? r.expected_participants,
      actualParticipants: r.actualParticipants ?? r.actual_participants,
      budgetHead: r.budgetHead || r.budget_head,
    }))
  );
  res.status(201).json({ count: created.length, ids: created.map((c) => c._id) });
});

router.post('/expenses', requireRole('expenses'), async (req: AuthRequest, res) => {
  if (!req.user || !req.body.rows || !Array.isArray(req.body.rows)) {
    return res.status(400).json({ message: 'Send { projectId, rows: [{ amount, category, description, date }] }' });
  }
  const { projectId, rows } = req.body;
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const created = await Expense.insertMany(
    rows.map((r: Record<string, unknown>, i: number) => ({
      expenseId: r.expenseId || r.expense_id || `EXP-${Date.now()}-${i + 1}`,
      project: projectId,
      activity: r.activityId || r.activity_id,
      amount: Number(r.amount) || 0,
      category: r.category || 'General',
      description: String(r.description || ''),
      date: r.date ? new Date(r.date as string) : new Date(),
      submittedBy: req.user!.id,
      status: 'submitted',
    }))
  );
  res.status(201).json({ count: created.length, ids: created.map((c) => c._id) });
});

/** Parse Excel file from multipart upload and return JSON for preview (optional use by client) */
router.post('/parse-excel', requireRole('activities', 'expenses'), async (req: AuthRequest, res) => {
  if (!req.body.base64) return res.status(400).json({ message: 'Send { base64: "..." } of Excel file' });
  try {
    const buf = Buffer.from(req.body.base64, 'base64');
    const wb = XLSX.read(buf, { type: 'buffer' });
    const first = wb.SheetNames[0];
    const ws = wb.Sheets[first];
    const rows = XLSX.utils.sheet_to_json(ws);
    res.json({ sheetName: first, rows });
  } catch (e) {
    res.status(400).json({ message: 'Invalid Excel file' });
  }
});

export const bulkImportRoutes = router;
