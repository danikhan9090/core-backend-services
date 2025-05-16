import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { Form, IFormField } from '../models/Form';
import { createFormSchema, updateFormSchema } from '../validations/form';

// Define the form field schema
const formFieldSchema = z.object({
  name: z.string(),
  type: z.enum(['text', 'email', 'number', 'select', 'checkbox', 'radio', 'textarea']),
  required: z.boolean(),
  options: z.array(z.string()).optional()
});

// Define the form schema
const formSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(formFieldSchema)
});

// Create form
export const createForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = formSchema.parse(req.body);
    
    // Ensure all fields have required property set
    const fields: IFormField[] = validatedData.fields.map(field => ({
      name: field.name,
      type: field.type,
      required: field.required,
      options: field.options
    }));

    const form = await Form.create({
      title: validatedData.title,
      description: validatedData.description,
      fields
    });

    logger.info('Form created successfully', {
      formId: form.id,
      title: form.title
    });

    res.status(201).json({
      status: 'success',
      data: form
    });
  } catch (error) {
    next(error);
  }
};

// Get form by ID
export const getForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);

    if (!form) {
      throw new NotFoundError('Form not found');
    }

    res.status(200).json({
      status: 'success',
      data: form
    });
  } catch (error) {
    next(error);
  }
};

// Update form
export const updateForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = formSchema.parse(req.body);
    
    // Ensure all fields have required property set
    const fields: IFormField[] = validatedData.fields.map(field => ({
      name: field.name,
      type: field.type,
      required: field.required,
      options: field.options
    }));

    const form = await Form.findById(id);
    if (!form) {
      throw new NotFoundError('Form not found');
    }

    form.title = validatedData.title;
    form.description = validatedData.description;
    form.fields = fields;
    await form.save();

    logger.info('Form updated successfully', {
      formId: id,
      title: form.title
    });

    res.status(200).json({
      status: 'success',
      data: form
    });
  } catch (error) {
    next(error);
  }
};

// Delete form
export const deleteForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);
    
    if (!form) {
      throw new NotFoundError('Form not found');
    }

    await form.deleteOne();

    logger.info('Form deleted successfully', {
      formId: id
    });

    res.status(200).json({
      status: 'success',
      message: 'Form deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}; 