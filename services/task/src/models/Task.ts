import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: 'complete' | 'incomplete';
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['complete', 'incomplete'],
      default: 'incomplete',
    },
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model<ITask>('Task', taskSchema); 