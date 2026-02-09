import mongoose, { Document, Schema } from 'mongoose';

export interface ILetterTemplate extends Document {
  name: string;
  category: string;
  variables: string;
  body: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILetterInstance extends Document {
  letterId: string;
  template: mongoose.Types.ObjectId;
  employee: mongoose.Types.ObjectId;
  letterType: string;
  status: string;
  generatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const templateSchema = new Schema<ILetterTemplate>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    variables: { type: String, default: '' },
    body: { type: String, default: '' },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const instanceSchema = new Schema<ILetterInstance>(
  {
    letterId: { type: String, required: true },
    template: { type: Schema.Types.ObjectId, ref: 'LetterTemplate', required: true },
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    letterType: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'sent'] },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const LetterTemplate = mongoose.model<ILetterTemplate>('LetterTemplate', templateSchema);
export const LetterInstance = mongoose.model<ILetterInstance>('LetterInstance', instanceSchema);
