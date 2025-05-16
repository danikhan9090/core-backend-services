import mongoose, { Document, Schema } from 'mongoose';
import { logger } from '../utils/logger';
import config from '../config';

const { priorityLevels, statusOptions } = config.task;

export interface ITask extends Document {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: Date;
  assignedTo: string;
  createdBy: string;
  tags: string[];
  attachments: string[];
  comments: Array<{
    text: string;
    createdBy: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: priorityLevels.split(','),
        message: `Priority must be one of: ${priorityLevels}`
      }
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: statusOptions.split(','),
        message: `Status must be one of: ${statusOptions}`
      },
      default: 'pending'
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: function(value: Date) {
          return value > new Date();
        },
        message: 'Due date must be in the future'
      }
    },
    assignedTo: {
      type: String,
      required: [true, 'Assignee is required'],
      trim: true
    },
    createdBy: {
      type: String,
      required: [true, 'Creator is required'],
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    attachments: [{
      type: String
    }],
    comments: [{
      text: {
        type: String,
        required: true,
        trim: true
      },
      createdBy: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

// Create indexes
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ priority: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Log task creation/update
  logger.info(`Task ${this.isNew ? 'created' : 'updated'}`, {
    taskId: this._id,
    title: this.title,
    status: this.status,
    assignedTo: this.assignedTo
  });
  next();
});

// Static method to check task limit per user
taskSchema.statics.checkUserTaskLimit = async function(userId: string): Promise<boolean> {
  const maxTasks = config.task.maxTasksPerUser;
  const taskCount = await this.countDocuments({ createdBy: userId });
  return taskCount < maxTasks;
};

// Method to check if task is expired
taskSchema.methods.isExpired = function(): boolean {
  const expiryDays = config.task.expiryDays;
  const expiryDate = new Date(this.dueDate);
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  return new Date() > expiryDate;
};

export const Task = mongoose.model<ITask>('Task', taskSchema); 