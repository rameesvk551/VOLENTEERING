import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is admin
 * For now, just checks for any authenticated user
 * In production, should verify role from JWT
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  // Check if user is authenticated
  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  // Check if user has admin role
  if (userRole !== 'admin' && userRole !== 'super_admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
    return;
  }

  next();
};
