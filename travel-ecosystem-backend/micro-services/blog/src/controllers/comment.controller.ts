import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/Comment.js';

// @route   GET /api/blog/comments/:blogId
// @desc    Get all comments for a blog
// @access  Public
export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [comments, total] = await Promise.all([
      Comment.find({ blogId, isApproved: true })
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum),
      Comment.countDocuments({ blogId, isApproved: true })
    ]);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalComments: total,
          limit: limitNum
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   POST /api/blog/comments
// @desc    Add a comment
// @access  Private
export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { blogId, content, parentCommentId } = req.body;
    const userId = req.headers['x-user-id'] as string;
    const userName = req.headers['x-user-name'] as string || 'Anonymous';
    const userEmail = req.headers['x-user-email'] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const comment = await Comment.create({
      blogId,
      user: {
        id: userId,
        name: userName,
        email: userEmail
      },
      content: content.trim(),
      parentCommentId: parentCommentId || null
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   PUT /api/blog/comments/:id
// @desc    Update a comment
// @access  Private
export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments'
      });
    }

    comment.content = content.trim();
    await comment.save();

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   DELETE /api/blog/comments/:id
// @desc    Delete a comment
// @access  Private
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Allow user to delete their own comment or admin to delete any comment
    if (comment.user.id !== userId && userRole !== 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    await Comment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   POST /api/blog/comments/:id/like
// @desc    Like/Unlike a comment
// @access  Private
export const toggleCommentLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      data: {
        liked: likeIndex === -1,
        totalLikes: comment.likes.length
      }
    });
  } catch (error: any) {
    next(error);
  }
};
