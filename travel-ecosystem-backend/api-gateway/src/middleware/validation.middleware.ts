import { Request, Response, NextFunction } from 'express';

/**
 * Validates pagination parameters for admin blog listing queries to protect downstream services
 * from malformed values (e.g. strings, negatives, extremely large numbers).
 */
export const validateAdminBlogQuery = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' && req.path.startsWith('/posts')) {
    const { page, limit } = req.query;

    if (typeof page === 'string') {
      const pageNumber = Number(page);
      if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid "page" query parameter. It must be a positive integer.'
        });
      }
    }

    if (typeof limit === 'string') {
      const limitNumber = Number(limit);
      if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid "limit" query parameter. It must be a positive integer up to 100.'
        });
      }
    }
  }

  next();
};
