import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { getCurrentEmployee } from './employees.js';
import { Activity } from '../models/Activity.js';
import { Budget } from '../models/Budget.js';
import { Project } from '../models/Project.js';
import { Expense } from '../models/Expense.js';
import { Employee } from '../models/Employee.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Attendance } from '../models/Attendance.js';
import { FormSubmission } from '../models/FormSubmission.js';
import { Beneficiary } from '../models/Beneficiary.js';
import { isDBConnected } from '../config/db.js';
import { dashboardStats, SUPRAJA_ACTIVITIES, SUPRAJA_BUDGET, DEMO_ATTENDANCE, DEMO_LEAVE, DEMO_FORM_SUBMISSIONS, DEMO_BENEFICIARIES } from '../data/suprajaDemo.js';

const router = Router();
router.use(requireAuth);

// Field-team / my analytics for mobile dashboard
router.get('/me', async (req: AuthRequest, res) => {
  const employee = await getCurrentEmployee(req);
  if (!employee) return res.status(401).json({ message: 'Not authenticated' });
  const empId = employee._id != null ? String(employee._id) : '';
  const empName = (employee.name as string) ?? '';

  if (!isDBConnected()) {
    const myAttendanceCount = DEMO_ATTENDANCE.filter(
      (a: { employee?: { _id?: string } }) => (a.employee && typeof a.employee === 'object' && (a.employee as { _id?: string })._id === empId)
    ).length;
    const demoLeave = DEMO_LEAVE as { employee?: { _id?: string }; status?: string }[];
    const myLeaveCount = demoLeave.filter(
      (l) => l.employee && typeof l.employee === 'object' && (l.employee as { _id?: string })._id === empId
    ).length;
    const pendingLeave = demoLeave.filter(
      (l) => l.employee && typeof l.employee === 'object' && (l.employee as { _id?: string })._id === empId && l.status === 'pending'
    ).length;
    let myFormSubmissionsCount = 0;
    for (const subs of Object.values(DEMO_FORM_SUBMISSIONS)) {
      myFormSubmissionsCount += subs.filter((s) => s.submittedBy?.name === empName).length;
    }
    return res.json({
      employee,
      myAttendanceCount,
      myLeaveCount,
      myFormSubmissionsCount,
      pendingLeave,
    });
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setMilliseconds(-1);

  let [myAttendanceCount, myLeaveCount, myFormSubmissionsCount, pendingLeave] = await Promise.all([
    Attendance.countDocuments({ employee: empId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
    LeaveRequest.countDocuments({ employee: empId }),
    FormSubmission.countDocuments({ submittedBy: req.user!.id }),
    LeaveRequest.countDocuments({ employee: empId, status: 'pending' }),
  ]);

  if (myFormSubmissionsCount === 0) {
    const { DEMO_USER_TO_SUBMISSION_NAME } = await import('./forms.js');
    const matchName = DEMO_USER_TO_SUBMISSION_NAME[req.user!.username] || empName;
    for (const subs of Object.values(DEMO_FORM_SUBMISSIONS)) {
      myFormSubmissionsCount += subs.filter((s) => s.submittedBy?.name === empName || s.submittedBy?.name === matchName).length;
    }
  }

  res.json({
    employee,
    myAttendanceCount,
    myLeaveCount,
    myFormSubmissionsCount,
    pendingLeave,
  });
});

router.get('/', requireRole('dashboard'), async (_req, res) => {
  if (!isDBConnected()) {
    const allocated = SUPRAJA_BUDGET.reduce((s, b) => s + (b.allocated ?? 0), 0);
    const utilized = SUPRAJA_BUDGET.reduce((s, b) => s + (b.spent ?? b.utilized ?? 0), 0);
    const beneficiariesReached = (DEMO_BENEFICIARIES as { count?: number }[]).reduce((s, b) => s + (b.count ?? 0), 0);
    return res.json({
      ...dashboardStats,
      beneficiariesReached,
      activities: SUPRAJA_ACTIVITIES,
      budgetSummary: SUPRAJA_BUDGET,
      programWiseSummary: [{ projectId: 'demo-supraja-project', projectName: 'Supraja Foundation - FPO Development', allocated, utilized, utilizationPercent: allocated ? Math.round((utilized / allocated) * 100) : 0, activityCount: SUPRAJA_ACTIVITIES.length }],
    });
  }
  const [activityCount, projectCount, expenseCount, employeeCount, pendingLeave, beneficiaryAgg] = await Promise.all([
    Activity.countDocuments(),
    Project.countDocuments(),
    Expense.countDocuments(),
    Employee.countDocuments(),
    LeaveRequest.countDocuments({ status: 'pending' }),
    Beneficiary.aggregate([{ $group: { _id: null, total: { $sum: '$count' } } }]),
  ]);
  const beneficiariesReached = beneficiaryAgg[0]?.total ?? 0;
  const hasData = activityCount > 0 || projectCount > 0 || expenseCount > 0 || employeeCount > 0;
  if (!hasData) {
    return res.json({
      ...dashboardStats,
      beneficiariesReached,
      activities: SUPRAJA_ACTIVITIES,
      budgetSummary: SUPRAJA_BUDGET,
      programWiseSummary: [],
    });
  }
  const [activitiesRaw, budgetList] = await Promise.all([
    Activity.find().populate('project', 'name').limit(50).lean(),
    Budget.find().populate('project', 'name').limit(20).lean(),
  ]);
  const activityIds = activitiesRaw.map((a) => (a as { _id?: unknown })._id);
  const expenseSums = await Expense.aggregate([
    { $match: { activity: { $in: activityIds }, status: { $ne: 'rejected' } } },
    { $group: { _id: '$activity', total: { $sum: '$amount' } } },
  ]);
  const expenseByActivity = new Map(expenseSums.map((e) => [String(e._id), e.total]));
  const activities = activitiesRaw.map((a) => {
    const aid = (a as { _id?: unknown })._id;
    const expenseTotal = aid ? expenseByActivity.get(String(aid)) ?? 0 : 0;
    return { ...a, expenses: expenseTotal };
  });
  const totalAllocated = budgetList.reduce((s, b) => s + (b.allocated ?? 0), 0);
  const totalSpent = budgetList.reduce((s, b) => s + (b.spent ?? b.utilized ?? 0), 0);
  const budgetSummary = budgetList.map((b) => {
    const spent = Number(b.spent ?? b.utilized ?? 0);
    const allocated = Number(b.allocated ?? 0);
    const utilizationPct = allocated ? Math.round((spent / allocated) * 100) : 0;
    return { ...b, spent, utilizationPct };
  });
  const allProjects = await Project.find().select('name').lean();
  const programWiseSummary = await Promise.all(
    allProjects.map(async (proj) => {
      const pid = (proj as { _id?: string })._id;
      if (!pid) return null;
      const [alloc, actCount] = await Promise.all([
        Budget.aggregate([{ $match: { project: pid } }, { $group: { _id: null, allocated: { $sum: '$allocated' }, utilized: { $sum: '$utilized' } } }]).then((r) => r[0]),
        Activity.countDocuments({ project: pid }),
      ]);
      const allocated = alloc?.allocated ?? 0;
      const utilized = alloc?.utilized ?? 0;
      return {
        projectId: String(pid),
        projectName: (proj as { name?: string }).name ?? '',
        allocated,
        utilized,
        utilizationPercent: allocated ? Math.round((utilized / allocated) * 100) : 0,
        activityCount: actCount,
      };
    })
  );
  const programWise = programWiseSummary.filter((p) => p != null);

  res.json({
    activityCount,
    projectCount,
    expenseCount,
    employeeCount,
    pendingLeave,
    beneficiariesReached,
    totalAllocated,
    totalSpent,
    activities,
    budgetSummary,
    programWiseSummary: programWise,
  });
});

export const dashboardRoutes = router;
