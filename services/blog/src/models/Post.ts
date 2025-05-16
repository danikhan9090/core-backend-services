import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: {
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
    content: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model<IPost>('Post', postSchema); 