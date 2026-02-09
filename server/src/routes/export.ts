import { Router } from 'express';
import XLSX from 'xlsx';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { Activity } from '../models/Activity.js';
import { Employee } from '../models/Employee.js';
import { FormSubmission } from '../models/FormSubmission.js';
import { MonitoringEntry } from '../models/MonitoringEntry.js';
import { isDBConnected } from '../config/db.js';
import { SUPRAJA_ACTIVITIES, SUPRAJA_BUDGET, FWWB_TEAM, DEMO_MONITORING } from '../data/suprajaDemo.js';
import type { AuthRequest } from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);

function activitiesToRows(list: Array<Record<string, unknown>>) {
  return list.map((a) => ({
    'Activity ID': a.activityId,
    'Activity Name': a.name,
    Quarter: a.quarter,
    Date: a.date,
    Location: a.location,
    'Expected Participants': a.expectedParticipants,
    'Actual Participants': a.actualParticipants,
    Budget: a.budget,
    Expenses: a.expenses,
    Variance: a.variance,
    Status: a.status,
    'Bill Status': a.billStatus,
    Project: (a.project as { name?: string })?.name || '',
  }));
}

router.get('/activities', requireRole('activities', 'reports'), async (_req: AuthRequest, res) => {
  let list: Array<Record<string, unknown>>;
  if (!isDBConnected()) {
    list = SUPRAJA_ACTIVITIES as unknown as Array<Record<string, unknown>>;
  } else {
    list = await Activity.find().populate('project', 'name').lean() as Array<Record<string, unknown>>;
  }
  const rows = isDBConnected()
    ? list.map((a) => ({
        ActivityID: a.activityId,
        Name: a.name,
        Project: (a.project as { name: string })?.name || '',
        Budget: a.budget,
        StartDate: a.startDate,
        EndDate: a.endDate,
        Status: a.status,
      }))
    : activitiesToRows(list);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Activities');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename=Supraja_Activities_Report.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

router.get('/budget', requireRole('budget', 'reports'), async (_req: AuthRequest, res) => {
  let list: Array<Record<string, unknown>>;
  if (!isDBConnected()) {
    list = SUPRAJA_BUDGET as unknown as Array<Record<string, unknown>>;
  } else {
    const { Budget } = await import('../models/Budget.js');
    list = await Budget.find().populate('project', 'name').lean() as Array<Record<string, unknown>>;
  }
  const rows = list.map((b) => ({
    'Budget Head': b.head,
    Allocated: b.allocated,
    Spent: b.spent ?? b.utilized,
    Variance: b.variance ?? (Number(b.allocated) - Number(b.spent ?? b.utilized)),
    'Variance %': b.variancePct ?? (b.allocated ? Math.round(((Number(b.spent ?? b.utilized) - Number(b.allocated)) / Number(b.allocated)) * 100) : 0),
    'Utilization %': b.utilizationPct ?? (b.allocated ? Math.round((Number(b.spent ?? b.utilized) / Number(b.allocated)) * 100) : 0),
    Activities: b.activities,
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Budget');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename=Supraja_Budget_Report.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

router.get('/employees', requireRole('employees', 'reports'), async (_req: AuthRequest, res) => {
  let list: Array<Record<string, unknown>>;
  if (!isDBConnected()) {
    list = FWWB_TEAM as unknown as Array<Record<string, unknown>>;
  } else {
    list = await Employee.find().lean() as Array<Record<string, unknown>>;
  }
  const rows = list.map((e: Record<string, unknown>) => ({
    EmployeeID: e.employeeId,
    Name: e.name,
    Email: e.email,
    Department: e.department,
    Designation: e.designation,
    Location: e.location,
    Status: e.status,
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Employees');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename=FWWB_Team_Members.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

router.get('/submissions', requireRole('form-builder', 'activities', 'reports'), async (_req: AuthRequest, res) => {
  const { DEMO_FORM_SUBMISSIONS, DEMO_FORMS } = await import('../data/suprajaDemo.js');
  let rows: Array<Record<string, unknown>> = [];
  if (!isDBConnected()) {
    const formTitles: Record<string, string> = {};
    (DEMO_FORMS as { _id: string; title: string }[]).forEach((f) => { formTitles[f._id] = f.title; });
    for (const subs of Object.values(DEMO_FORM_SUBMISSIONS)) {
      for (const s of subs) {
        const data = (s.data || {}) as Record<string, unknown>;
        rows.push({
          'Form': formTitles[s.form] || s.form,
          'Submitted By': (s.submittedBy as { name?: string })?.name || '',
          'Submitted At': s.createdAt,
          ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v])),
        });
      }
    }
  } else {
    const list = await FormSubmission.find().populate('form', 'title').populate('submittedBy', 'name').lean() as Array<Record<string, unknown>>;
    rows = list.map((s) => {
      const data = (s.data || {}) as Record<string, unknown>;
      return {
        Form: (s.form as { title?: string })?.title || '',
        'Submitted By': (s.submittedBy as { name?: string })?.name || '',
        'Submitted At': s.createdAt,
        ...data,
      };
    });
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename=Form_Submissions.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

router.get('/monitoring', requireRole('monitoring', 'reports'), async (_req: AuthRequest, res) => {
  let list: Array<Record<string, unknown>>;
  if (!isDBConnected()) {
    list = DEMO_MONITORING as unknown as Array<Record<string, unknown>>;
  } else {
    list = await MonitoringEntry.find().populate('project', 'name').populate('collectedBy', 'name').lean() as Array<Record<string, unknown>>;
  }
  const rows = list.map((m) => ({
    'Entry ID': m.entryId,
    'Project': (m.project as { name?: string })?.name || '',
    'Activity': (m.activity as { name?: string })?.name || '',
    'Location': m.location,
    'Date': m.date,
    'Expected Participants': m.expectedParticipants,
    'Actual Participants': m.actualParticipants,
    'Notes': m.notes,
    'Collected By': (m.collectedBy as { name?: string })?.name || '',
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Monitoring');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename=Monitoring_Entries.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

export const exportRoutes = router;
