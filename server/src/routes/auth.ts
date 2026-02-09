import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { requireAuth, type AuthRequest } from '../middleware/requireAuth.js';
import { ROLE_PERMISSIONS } from '../config/roles.js';
import type { RoleType } from '../config/roles.js';
import { getApprovalPermissions } from '../config/approvalMatrix.js';
import { isDBConnected } from '../config/db.js';

const authRoutes = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const COOKIE_OPTIONS = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, maxAge: 7 * 24 * 60 * 60 * 1000 };

export const DEMO_USERS: { username: string; password: string; name: string; role: string; type: RoleType; donorName?: string }[] = [
  { username: 'admin', password: 'demo123', name: 'Admin User', role: 'Management', type: 'management' },
  { username: 'program.user', password: 'demo123', name: 'Program User', role: 'Program Team', type: 'program' },
  { username: 'hr.user', password: 'demo123', name: 'HR User', role: 'HR Team', type: 'hr' },
  { username: 'admin.user', password: 'demo123', name: 'Admin Team User', role: 'Admin Team', type: 'admin' },
  { username: 'employee', password: 'demo123', name: 'Employee User', role: 'Employee', type: 'employee' },
  { username: 'donor', password: 'demo123', name: 'Donor / Funder', role: 'Donor', type: 'donor', donorName: 'FWWB / Donor' },
];

function signAccessToken(userId: string, username: string, type: string, demoUser?: { name: string; role: string; donorName?: string }): string {
  const payload = demoUser ? { userId, username, type, demo: true, name: demoUser.name, role: demoUser.role, donorName: demoUser.donorName } : { userId, username, type };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

function signRefreshToken(userId: string, demo?: boolean): string {
  return jwt.sign({ userId, demo: demo || false }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

authRoutes.post(
  '/login',
  body('username').trim().notEmpty(),
  body('password').notEmpty(),
  async (req, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((e) => (e as { msg?: string }).msg).filter(Boolean);
      res.status(400).json({ message: messages.length ? messages.join('. ') : 'Username and password are required', errors: errors.array() });
      return;
    }
    const { username, password } = req.body;

    // Try MongoDB first when connected
    if (isDBConnected()) {
      try {
        const user = await User.findOne({ username }).select('+password +refreshToken');
        if (user && (await user.comparePassword(password))) {
          const accessToken = signAccessToken(user._id.toString(), user.username, user.type);
          const refreshToken = signRefreshToken(user._id.toString());
          user.refreshToken = refreshToken;
          await user.save();
          res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
          res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
          res.json({
            user: { id: user._id.toString(), username: user.username, name: user.name, role: user.role, type: user.type },
            accessToken,
            refreshToken,
            expiresIn: 900,
          });
          return;
        }
      } catch (err) {
        console.warn('MongoDB auth failed, falling back to demo auth:', err);
      }
    }

    // Demo auth (no MongoDB required)
    const demo = DEMO_USERS.find((u) => u.username === username && u.password === password);
    if (demo) {
      const userId = `demo-${demo.username}`;
      const accessToken = signAccessToken(userId, demo.username, demo.type, { name: demo.name, role: demo.role, donorName: demo.donorName });
      const refreshToken = signRefreshToken(userId, true);
      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
      res.json({
        user: { id: userId, username: demo.username, name: demo.name, role: demo.role, type: demo.type, donorName: demo.donorName },
        accessToken,
        refreshToken,
        expiresIn: 900,
      });
      return;
    }

    res.status(401).json({ message: 'Invalid username or password' });
  }
);

authRoutes.post('/refresh', async (req, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    res.status(401).json({ message: 'Refresh token required' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; demo?: boolean };
    if (decoded.demo) {
      const demo = DEMO_USERS.find((u) => `demo-${u.username}` === decoded.userId);
      if (!demo) {
        res.status(401).json({ message: 'Invalid refresh token' });
        return;
      }
      const accessToken = signAccessToken(decoded.userId, demo.username, demo.type, { name: demo.name, role: demo.role });
      res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
      res.json({
        user: { id: decoded.userId, username: demo.username, name: demo.name, role: demo.role, type: demo.type },
        accessToken,
        refreshToken: token,
        expiresIn: 900,
      });
      return;
    }
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }
    const accessToken = signAccessToken(user._id.toString(), user.username, user.type);
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    const newRefresh = signRefreshToken(user._id.toString());
    user.refreshToken = newRefresh;
    await user.save();
    res.json({
      user: { id: user._id.toString(), username: user.username, name: user.name, role: user.role, type: user.type },
      accessToken,
      refreshToken: newRefresh,
      expiresIn: 900,
    });
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

authRoutes.post('/logout', async (req, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken;
  if (token && isDBConnected()) {
    try {
      const decoded = jwt.decode(token) as { userId?: string; demo?: boolean } | null;
      if (decoded?.userId && !decoded.demo) {
        await User.findByIdAndUpdate(decoded.userId, { $unset: { refreshToken: 1 } });
      }
    } catch {
      /* ignore */
    }
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

authRoutes.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization?.replace('Bearer ', '');
  const token = req.cookies?.accessToken || authHeader;
  if (!token) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; demo?: boolean; username?: string; type?: string; name?: string; role?: string };
    if (decoded.demo && decoded.username && decoded.name && decoded.role && decoded.type) {
      res.json({ user: { id: decoded.userId, username: decoded.username, name: decoded.name, role: decoded.role, type: decoded.type } });
      return;
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    res.json({ user: { id: user._id.toString(), username: user.username, name: user.name, role: user.role, type: user.type } });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

authRoutes.post(
  '/change-password',
  requireAuth,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    if (!req.user?.id) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (req.user.id.startsWith('demo-')) {
      res.status(400).json({ message: 'Password change for demo users is not supported. Use database login.' });
      return;
    }
    if (!isDBConnected()) {
      res.status(400).json({ message: 'Password change requires database.' });
      return;
    }
    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.comparePassword(req.body.currentPassword))) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  }
);

authRoutes.get('/permissions', async (req: AuthRequest, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization?.replace('Bearer ', '');
  const token = req.cookies?.accessToken || authHeader;
  if (!token) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; demo?: boolean; type?: string };
    const roleType = (decoded.type as RoleType) || undefined;
    const permissions = roleType ? (ROLE_PERMISSIONS[roleType] || []) : [];
    const approvalPermissions = roleType ? getApprovalPermissions(roleType) : undefined;
    if (decoded.demo && roleType) {
      res.json({ permissions, approval: approvalPermissions });
      return;
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    const userRoleType = user.type as RoleType;
    res.json({
      permissions: ROLE_PERMISSIONS[userRoleType] || [],
      approval: getApprovalPermissions(userRoleType),
    });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export { authRoutes };
