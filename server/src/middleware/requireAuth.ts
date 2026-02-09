import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { isDBConnected } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface JwtPayload {
  userId: string;
  username: string;
  type: string;
  demo?: boolean;
  name?: string;
  role?: string;
  donorName?: string;
}

export interface AuthRequest extends Request {
  user?: { id: string; username: string; type: string; name: string; role: string; donorName?: string };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (decoded.demo && decoded.name && decoded.role) {
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        name: decoded.name,
        role: decoded.role,
        type: decoded.type,
        donorName: decoded.donorName,
      };
      next();
      return;
    }
    if (!isDBConnected()) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    const user = await User.findById(decoded.userId).select('username name role type');
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    req.user = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      role: user.role,
      type: user.type as string,
    };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
