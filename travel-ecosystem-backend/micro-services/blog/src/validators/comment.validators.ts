import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const addCommentValidator = [
  body('blogId').isString().notEmpty().withMessage('blogId is required'),
  body('content').isString().isLength({ min: 1 }).withMessage('Content is required'),
  body('parentCommentId').optional().isString(),
  handleValidation,
];

export const updateCommentValidator = [
  param('id').isMongoId().withMessage('Invalid comment id'),
  body('content').isString().isLength({ min: 1 }).withMessage('Content is required'),
  handleValidation,
];

export default { addCommentValidator, updateCommentValidator };
