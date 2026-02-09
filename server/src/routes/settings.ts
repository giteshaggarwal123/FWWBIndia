import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import type { AuthRequest } from '../middleware/requireAuth.js';
import { OrganizationSettings } from '../models/OrganizationSettings.js';
import { isDBConnected } from '../config/db.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('settings', 'user-mgmt', 'dashboard'));

const DEFAULT_ORG = {
  name: "Friends of Women's World Banking India",
  shortName: 'FWWB India',
  tagline: 'Empowering Millions of Indian Women',
  address: '101, Sakar-I, Opp. Gandhigram Railway Station, Ashram Road',
  city: 'Ahmedabad 380 009, Gujarat, India',
  email: 'info@fwwbindia.org',
  phone: '+91 79 2658 1234',
  website: 'https://fwwbindia.org',
  financialYearStart: 'April - March',
  currentFY: '2024-25',
  currency: 'INR',
};

router.get('/organization', async (_req: AuthRequest, res) => {
  if (!isDBConnected()) {
    return res.json(DEFAULT_ORG);
  }
  let doc = await OrganizationSettings.findOne().lean();
  if (!doc) {
    const created = await OrganizationSettings.create(DEFAULT_ORG);
    doc = created.toObject();
  }
  res.json(doc);
});

router.patch('/organization', requireRole('user-mgmt', 'settings'), async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    return res.json({ ...DEFAULT_ORG, ...req.body });
  }
  let doc = await OrganizationSettings.findOne();
  if (!doc) {
    doc = await OrganizationSettings.create(DEFAULT_ORG);
  }
  const allowed = [
    'name', 'shortName', 'tagline', 'address', 'city', 'email', 'phone', 'website',
    'financialYearStart', 'currentFY', 'currency',
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) (doc as unknown as Record<string, unknown>)[key] = req.body[key];
  }
  await doc.save();
  res.json(doc.toObject());
});

/** Return list of financial years (e.g. last 5 and next 1 from current). */
router.get('/financial-years', async (req: AuthRequest, res) => {
  if (!isDBConnected()) {
    const current = '2024-25';
    const years: string[] = [];
    for (let i = 4; i >= 0; i--) {
      const [s, e] = current.split('-').map(Number);
      years.push(`${s - i}-${String((e - i) % 100).padStart(2, '0')}`);
    }
    years.push('2025-26');
    return res.json(years);
  }
  let doc = await OrganizationSettings.findOne().select('currentFY').lean();
  const current = (doc as { currentFY?: string } | null)?.currentFY || '2024-25';
  const [startPart] = current.split('-').map(Number);
  const years: string[] = [];
  for (let i = 4; i >= 0; i--) {
    const s = startPart - i;
    years.push(`${s}-${String((s + 1) % 100).padStart(2, '0')}`);
  }
  years.push(`${startPart + 1}-${String((startPart + 2) % 100).padStart(2, '0')}`);
  res.json(years);
});

export const settingsRoutes = router;
