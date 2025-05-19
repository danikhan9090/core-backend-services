import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task';
import { createTaskSchema, updateTaskSchema, listTasksSchema } from '../validations/task';
import { NotFoundError } from '../utils/errors';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskData = req.body;
    const validatedData = createTaskSchema.parse({ body: taskData });
    const task = await Task.create(validatedData.body);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = listTasksSchema.parse({ query: req.query });
    const query = validatedData.query || {};
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assignedTo) filter.assignedTo = query.assignedTo;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ [query.sortBy || 'dueDate']: query.sortOrder === 'asc' ? 1 : -1 })
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
    const updateData = req.body;
    const validatedData = updateTaskSchema.parse({ body: updateData });
    const task = await Task.findById(id);
    if (!task) throw new NotFoundError('Task not found');

    Object.assign(task, validatedData.body);
    await task.save();
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
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 