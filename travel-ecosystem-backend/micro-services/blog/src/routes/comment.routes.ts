import express from 'express';
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike
} from '../controllers/comment.controller.js';
import commentValidators from '../validators/comment.validators.js';

const router = express.Router();

router.get('/:blogId', getComments);
router.post('/', commentValidators.addCommentValidator, addComment);
router.put('/:id', commentValidators.updateCommentValidator, updateComment);
router.delete('/:id', commentValidators.updateCommentValidator, deleteComment);
router.post('/:id/like', commentValidators.updateCommentValidator, toggleCommentLike);

export default router;
