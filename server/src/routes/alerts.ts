import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { InsurancePolicy } from '../models/InsurancePolicy.js';
import { Asset } from '../models/Asset.js';
import { TravelRequest } from '../models/TravelRequest.js';
import { AdminExpense } from '../models/AdminExpense.js';
import { StationeryRequest } from '../models/StationeryRequest.js';
import { isDBConnected } from '../config/db.js';

const router = Router();
router.use(requireAuth);

/** Alerts for dashboard: renewals (30/60/90), warranty expiring, travel pending, monthly admin, stationery summary */
router.get('/', async (_req, res) => {
  if (!isDBConnected()) {
    return res.json({
      insuranceRenewals30: 1,
      insuranceRenewals60: 0,
      insuranceRenewals90: 0,
      warrantyExpiring: 0,
      travelPending: 1,
      adminExpensesThisMonth: 2,
      stationeryPending: 1,
      stationerySummary: [{ _id: 'Programs', count: 2 }, { _id: 'Administration', count: 1 }],
    });
  }
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [insuranceRenewals30, insuranceRenewals60, insuranceRenewals90, warrantyExpiring, travelPending, adminExpensesThisMonth, stationeryPending] = await Promise.all([
    InsurancePolicy.countDocuments({ status: 'active', endDate: { $gte: now, $lte: in30 } }),
    InsurancePolicy.countDocuments({ status: 'active', endDate: { $gte: in30, $lte: in60 } }),
    InsurancePolicy.countDocuments({ status: 'active', endDate: { $gte: in60, $lte: in90 } }),
    Asset.countDocuments({ warrantyExpiry: { $gte: now, $lte: in90 } }),
    TravelRequest.countDocuments({ status: 'pending' }),
    AdminExpense.countDocuments({
      date: { $gte: new Date(now.getFullYear(), now.getMonth(), 1), $lte: now },
      status: 'approved',
    }),
    StationeryRequest.countDocuments({ status: 'pending' }),
  ]);

  const stationerySummary = await StationeryRequest.aggregate([
    { $match: { status: 'fulfilled' } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
  ]);

  res.json({
    insuranceRenewals30,
    insuranceRenewals60,
    insuranceRenewals90,
    warrantyExpiring,
    travelPending,
    adminExpensesThisMonth,
    stationeryPending,
    stationerySummary,
  });
});

export const alertsRoutes = router;
