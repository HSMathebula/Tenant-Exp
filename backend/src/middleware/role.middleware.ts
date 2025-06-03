import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Convenience middleware for common role checks
export const requireAdmin = requireRole([UserRole.ADMIN]);
export const requirePropertyManager = requireRole([UserRole.PROPERTY_MANAGER, UserRole.ADMIN]);
export const requireTenant = requireRole([UserRole.TENANT]);
export const requireStaff = requireRole([UserRole.BUILDING_STAFF, UserRole.PROPERTY_MANAGER, UserRole.ADMIN]); 