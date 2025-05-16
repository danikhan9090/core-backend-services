import { Request, Response, NextFunction } from 'express';
import { Post } from '../models/Post';
import { createPostSchema, updatePostSchema } from '../validations/post';
import { BadRequestError, NotFoundError } from '@backend-services/shared';

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new BadRequestError('Authentication required');
    const { title, content } = createPostSchema.parse(req.body);
    const post = await Post.create({
      author: req.user.userId,
      title,
      content,
    });
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const posts = await Post.find({ isDeleted: false }).skip(skip).limit(limit).populate('author', 'username');
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new BadRequestError('Authentication required');
    const { id } = req.params;
    const { title, content } = updatePostSchema.parse(req.body);
    const post = await Post.findOne({ _id: id, isDeleted: false });
    if (!post) throw new NotFoundError('Post not found');
    if (post.author.toString() !== req.user.userId) throw new BadRequestError('Not authorized');
    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();
    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const softDeletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new BadRequestError('Authentication required');
    const { id } = req.params;
    const post = await Post.findOne({ _id: id, isDeleted: false });
    if (!post) throw new NotFoundError('Post not found');
    if (post.author.toString() !== req.user.userId) throw new BadRequestError('Not authorized');
    post.isDeleted = true;
    await post.save();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
}; 