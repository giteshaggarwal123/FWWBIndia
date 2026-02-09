import mongoose, { Document, Schema } from 'mongoose';

export interface IFormSubmission extends Document {
  form: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
  data: Record<string, unknown>;
  lat?: number;
  lng?: number;
  createdAt: Date;
  updatedAt: Date;
}

const formSubmissionSchema = new Schema<IFormSubmission>(
  {
    form: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    lat: Number,
    lng: Number,
  },
  { timestamps: true }
);

export const FormSubmission = mongoose.model<IFormSubmission>('FormSubmission', formSubmissionSchema);
