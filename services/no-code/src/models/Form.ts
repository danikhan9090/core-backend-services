import mongoose, { Document, Schema } from 'mongoose';

// Define the form field interface
export interface IFormField {
  name: string;
  type: string;
  required: boolean;
  options?: string[];
}

// Define the form interface
export interface IForm extends Document {
  title: string;
  description?: string;
  fields: IFormField[];
  createdAt: Date;
  updatedAt: Date;
}

// Create the form schema
const formSchema = new Schema<IForm>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    fields: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        type: {
          type: String,
          required: true,
          enum: ['text', 'email', 'number', 'select', 'checkbox', 'radio', 'textarea']
        },
        required: {
          type: Boolean,
          required: true,
          default: false
        },
        options: [{
          type: String,
          trim: true
        }]
      }
    ]
  },
  {
    timestamps: true
  }
);

// Create indexes
formSchema.index({ title: 1 });
formSchema.index({ createdAt: -1 });

// Create and export the model
export const Form = mongoose.model<IForm>('Form', formSchema); 