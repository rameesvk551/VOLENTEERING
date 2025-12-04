import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const createBlogValidators = [
  body('title').isString().isLength({ min: 10 }).withMessage('Title must be at least 10 characters'),
  body('content').isString().isLength({ min: 100 }).withMessage('Content must be at least 100 characters'),
  body('excerpt').optional().isString().isLength({ max: 500 }),
  body('category').isString().withMessage('Category is required'),
  body('tags').optional().isArray(),
  body('isFeatured').optional().isBoolean(),
  handleValidation,
];

export const updateBlogValidators = [
  param('id').isMongoId().withMessage('Invalid blog id'),
  body('title').optional().isString().isLength({ min: 10 }),
  body('content').optional().isString().isLength({ min: 100 }),
  body('excerpt').optional().isString().isLength({ max: 500 }),
  body('tags').optional().isArray(),
  handleValidation,
];

export const rateValidator = [
  param('id').isMongoId().withMessage('Invalid blog id'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  handleValidation,
];

export const idParamValidator = [
  param('id').isMongoId().withMessage('Invalid id'),
  handleValidation,
];

export default {
  createBlogValidators,
  updateBlogValidators,
  rateValidator,
  idParamValidator,
};
