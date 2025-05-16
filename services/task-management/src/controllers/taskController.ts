import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task';
import { createTaskSchema, updateTaskSchema, listTasksSchema } from '../validations/task';
import { NotFoundError } from '../utils/errors';
import { cache } from '@backend-services/shared';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskData = createTaskSchema.parse(req.body);
    const task = await Task.create({
      ...taskData,
      createdBy: req.user?.userId,
    });
    await cache.del('tasks:*');
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = listTasksSchema.parse(req.query);
    const { query } = validatedData;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `tasks:${JSON.stringify(query)}:${page}:${limit}`;
    const cachedTasks = await cache.get(cacheKey);
    if (cachedTasks) {
      return res.json(cachedTasks);
    }

    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assignedTo) filter.assignedTo = query.assignedTo;
    if (query.createdBy) filter.createdBy = query.createdBy;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    const result = {
      tasks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    await cache.set(cacheKey, result, 300); // Cache for 5 minutes
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) throw new NotFoundError('Task not found');
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = updateTaskSchema.parse(req.body);
    const task = await Task.findById(id);
    if (!task) throw new NotFoundError('Task not found');

    Object.assign(task, updateData);
    await task.save();
    await cache.del('tasks:*');
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) throw new NotFoundError('Task not found');
    await cache.del('tasks:*');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 