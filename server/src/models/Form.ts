import mongoose, { Document, Schema } from 'mongoose';

export type FormFieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';

export interface IFormField {
  key: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: string[];
}

export interface IForm extends Document {
  title: string;
  description?: string;
  fields: IFormField[];
  project?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const formFieldSchema = new Schema<IFormField>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true, enum: ['text', 'number', 'date', 'select', 'textarea'] },
    required: { type: Boolean, default: false },
    options: [String],
  },
  { _id: false }
);

const formSchema = new Schema<IForm>(
  {
    title: { type: String, required: true },
    description: String,
    fields: [formFieldSchema],
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'active', enum: ['active', 'draft', 'archived'] },
  },
  { timestamps: true }
);

export const Form = mongoose.model<IForm>('Form', formSchema);
