import { Request, Response, NextFunction } from 'express';
import { Workflow } from '../models/Workflow';
import { createWorkflowSchema, updateWorkflowSchema } from '../validations/workflow';
import { NotFoundError } from '@backend-services/shared';

export const createWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, steps, triggers } = createWorkflowSchema.parse(req.body);
    const workflow = await Workflow.create({ name, steps, triggers });
    res.status(201).json(workflow);
  } catch (error) {
    next(error);
  }
};

export const updateWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, steps, triggers } = updateWorkflowSchema.parse(req.body);
    const workflow = await Workflow.findById(id);
    if (!workflow) throw new NotFoundError('Workflow not found');
    workflow.name = name || workflow.name;
    workflow.steps = steps || workflow.steps;
    workflow.triggers = triggers || workflow.triggers;
    await workflow.save();
    res.json(workflow);
  } catch (error) {
    next(error);
  }
};

export const getWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const workflow = await Workflow.findById(id);
    if (!workflow) throw new NotFoundError('Workflow not found');
    res.json(workflow);
  } catch (error) {
    next(error);
  }
}; 