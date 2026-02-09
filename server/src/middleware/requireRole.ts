import { Response, NextFunction } from 'express';
import { hasPermission } from '../config/roles.js';
import type { RoleType } from '../config/roles.js';
import type { AuthRequest } from './requireAuth.js';

export function requireRole(...allowedModules: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    const userType = req.user.type as RoleType;
    const hasAny = allowedModules.some((mod) => hasPermission(userType, mod));
    if (!hasAny) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
