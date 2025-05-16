import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkflow extends Document {
  name: string;
  steps: Array<{
    name: string;
    action: string;
    config: Record<string, any>;
  }>;
  triggers: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const workflowSchema = new Schema<IWorkflow>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    steps: [
      {
        name: {
          type: String,
          required: true,
        },
        action: {
          type: String,
          required: true,
        },
        config: {
          type: Schema.Types.Mixed,
          required: true,
        },
      },
    ],
    triggers: [
      {
        type: {
          type: String,
          required: true,
        },
        config: {
          type: Schema.Types.Mixed,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Workflow = mongoose.model<IWorkflow>('Workflow', workflowSchema); 