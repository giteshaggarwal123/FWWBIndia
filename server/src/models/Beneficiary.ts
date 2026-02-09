import mongoose, { Document, Schema } from 'mongoose';

export interface IBeneficiary extends Document {
  project: mongoose.Types.ObjectId;
  activity?: mongoose.Types.ObjectId;
  type: string;
  category?: string;
  count: number;
  gender?: string;
  ageBand?: string;
  socialCategory?: string;
  state?: string;
  district?: string;
  location?: string;
  period?: string;
  notes?: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const beneficiarySchema = new Schema<IBeneficiary>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    activity: { type: Schema.Types.ObjectId, ref: 'Activity' },
    type: { type: String, required: true, enum: ['individual', 'SHG', 'FPO', 'community', 'other'] },
    category: String,
    count: { type: Number, required: true, min: 0 },
    gender: { type: String, enum: ['male', 'female', 'other', 'not_specified'], default: undefined },
    ageBand: { type: String, enum: ['0-18', '19-30', '31-45', '46-60', '60+'], default: undefined },
    socialCategory: { type: String, enum: ['SC', 'ST', 'OBC', 'General', 'other'], default: undefined },
    state: String,
    district: String,
    location: String,
    period: String,
    notes: String,
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Beneficiary = mongoose.model<IBeneficiary>('Beneficiary', beneficiarySchema);
