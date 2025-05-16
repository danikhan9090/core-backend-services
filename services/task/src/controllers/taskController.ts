import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task';
import { createTaskSchema, updateTaskSchema } from '../validations/task';
import { NotFoundError, BadRequestError } from '@backend-services/shared';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, status } = createTaskSchema.parse(req.body);
    const userId = req.user!.userId;
    const task = await Task.create({
      user: userId,
      title,
      description,
      status,
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, user: userId });
    if (!task) throw new NotFoundError('Task not found');
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updates = updateTaskSchema.parse(req.body);
    const task = await Task.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true }
    );
    if (!task) throw new NotFoundError('Task not found');
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: userId });
    if (!task) throw new NotFoundError('Task not found');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 