import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IUrl extends Document {
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: Date;
  expiresAt?: Date;
  userId?: string;
}

const urlSchema = new Schema<IUrl>(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(10)
    },
    clicks: {
      type: Number,
      required: true,
      default: 0
    },
    expiresAt: {
      type: Date,
      index: { expires: 0 }
    },
    userId: {
      type: String,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Create indexes
urlSchema.index({ shortCode: 1 });
urlSchema.index({ createdAt: -1 });
urlSchema.index({ userId: 1, createdAt: -1 });

// Create and export the model
export const Url = mongoose.model<IUrl>('Url', urlSchema); 