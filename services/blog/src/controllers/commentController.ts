import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/Comment';
import { createCommentSchema } from '../validations/comment';
import { BadRequestError } from '@backend-services/shared';

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new BadRequestError('Authentication required');
    const { postId } = req.params;
    const { content } = createCommentSchema.parse(req.body);
    const comment = await Comment.create({
      post: postId,
      author: req.user.userId,
      content,
    });
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId }).populate('author', 'username');
    res.json(comments);
  } catch (error) {
    next(error);
  }
}; 