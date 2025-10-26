import express from 'express';
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike
} from '../controllers/comment.controller.js';

const router = express.Router();

router.get('/:blogId', getComments);
router.post('/', addComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
router.post('/:id/like', toggleCommentLike);

export default router;
