import { Router } from 'express';
import { AssetMovement } from '../models/AssetMovement.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('assets'));

router.get('/asset/:assetId', async (req: AuthRequest, res) => {
  const list = await AssetMovement.find({ asset: req.params.assetId })
    .populate('fromEmployee', 'name employeeId')
    .populate('toEmployee', 'name employeeId')
    .populate('performedBy', 'name')
    .sort({ createdAt: -1 })
    .lean();
  res.json(list);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const doc = await AssetMovement.create({ ...req.body, performedBy: req.user.id });
  res.status(201).json(doc);
});

export const assetMovementRoutes = router;
