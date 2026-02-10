import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { Project } from '../models/Project.js';
import { Activity } from '../models/Activity.js';
import { Budget } from '../models/Budget.js';
import { Expense } from '../models/Expense.js';
import { Beneficiary } from '../models/Beneficiary.js';
import { isDBConnected } from '../config/db.js';
import { DONOR_PROGRAMS, SUPRAJA_PROJECT, SUPRAJA_ACTIVITIES, SUPRAJA_BUDGET, DEMO_EXPENSES } from '../data/suprajaDemo.js';
import type { AuthRequest } from '../middleware/requireAuth.js';

/** View-only donor portal: programs, financial utilization, impact. For donor/funder role. */
const router = Router();
router.use(requireAuth);
router.use(requireRole('donor-portal'));

router.get('/programs', async (req: AuthRequest, res) => {
  const donorFilter = req.user?.type === 'donor' && req.user?.donorName ? req.user.donorName : null;

  if (!isDBConnected()) {
    let list = DONOR_PROGRAMS;
    if (donorFilter) list = list.filter((p: { donor?: string }) => p.donor === donorFilter);
    return res.json(list);
  }
  const filter: { status: string; donor?: string } = { status: 'active' };
  if (donorFilter) filter.donor = donorFilter;
  const projects = await Project.find(filter)
    .populate('partner', 'name code')
    .lean();
  if (projects.length === 0 && !donorFilter) return res.json(DONOR_PROGRAMS);
  const withStats = await Promise.all(
    projects.map(async (p) => {
      const [activityCount, budgetDoc] = await Promise.all([
        Activity.countDocuments({ project: p._id }),
        Budget.aggregate([{ $match: { project: p._id } }, { $group: { _id: null, allocated: { $sum: '$allocated' }, utilized: { $sum: '$utilized' } } }]).then((r) => r[0]),
      ]);
      const allocated = budgetDoc?.allocated || 0;
      const utilized = budgetDoc?.utilized || 0;
      return {
        ...p,
        activityCount,
        allocated,
        utilized,
        utilizationPercent: allocated ? Math.round((utilized / allocated) * 100) : 0,
      };
    })
  );
  res.json(withStats);
});

router.get('/programs/:id', async (req: AuthRequest, res) => {
  if (!isDBConnected() && req.params.id === 'demo-supraja-project') {
    const allocated = SUPRAJA_BUDGET.reduce((s, b) => s + b.allocated, 0);
    const utilized = SUPRAJA_BUDGET.reduce((s, b) => s + b.spent, 0);
    const budgetsForDetail = SUPRAJA_BUDGET.map((b) => ({ head: b.head, allocated: b.allocated, utilized: b.spent }));
    const activitiesForDetail = SUPRAJA_ACTIVITIES.map((a) => ({ activityId: a.activityId, name: a.name, budget: a.budget, status: a.status }));
    const expensesForDetail = DEMO_EXPENSES.map((e) => ({ expenseId: e.expenseId, amount: e.amount, category: e.category, status: e.status }));
    return res.json({
      project: { ...SUPRAJA_PROJECT, partner: { name: 'Supraja Foundation' } },
      activities: activitiesForDetail,
      budgets: budgetsForDetail,
      expenses: expensesForDetail,
      summary: { allocated, utilized, utilizationPercent: allocated ? Math.round((utilized / allocated) * 100) : 0 },
      beneficiaries: { totalCount: 0, byType: [] },
    });
  }
  const project = await Project.findById(req.params.id).populate('partner').lean();
  if (!project) return res.status(404).json({ message: 'Not found' });
  const [activities, budgets, expenses, beneficiaryAgg] = await Promise.all([
    Activity.find({ project: req.params.id }).lean(),
    Budget.find({ project: req.params.id }).lean(),
    Expense.find({ project: req.params.id }).populate('activity', 'name').lean(),
    Beneficiary.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$type', count: { $sum: '$count' } } },
    ]),
  ]);
  const totalBeneficiaries = beneficiaryAgg.reduce((s, g) => s + (g.count || 0), 0);
  const beneficiaries = {
    totalCount: totalBeneficiaries,
    byType: beneficiaryAgg.map((g) => ({ type: g._id || 'other', count: g.count || 0 })),
  };
  const allocated = budgets.reduce((s, b) => s + (b.allocated || 0), 0);
  const utilized = budgets.reduce((s, b) => s + (b.utilized || 0), 0);
  res.json({
    project,
    activities,
    budgets,
    expenses,
    summary: { allocated, utilized, utilizationPercent: allocated ? Math.round((utilized / allocated) * 100) : 0 },
    beneficiaries,
  });
});

router.get('/financial-summary', async (_req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const allocated = SUPRAJA_BUDGET.reduce((s, b) => s + b.allocated, 0);
    const utilized = SUPRAJA_BUDGET.reduce((s, b) => s + b.spent, 0);
    return res.json({ allocated, utilized });
  }
  const budgets = await Budget.aggregate([
    { $group: { _id: null, allocated: { $sum: '$allocated' }, utilized: { $sum: '$utilized' } } },
  ]);
  const total = budgets[0] || { allocated: 0, utilized: 0 };
  res.json(total);
});

export const donorPortalRoutes = router;
