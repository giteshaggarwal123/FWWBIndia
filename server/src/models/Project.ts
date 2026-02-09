import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  code?: string;
  donor?: string;
  partner?: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  status: string;
  grantStartDate?: Date;
  grantEndDate?: Date;
  budgetCeiling?: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    code: String,
    donor: String,
    partner: { type: Schema.Types.ObjectId, ref: 'Partner' },
    startDate: Date,
    endDate: Date,
    status: { type: String, default: 'active', enum: ['active', 'completed', 'on-hold'] },
    grantStartDate: Date,
    grantEndDate: Date,
    budgetCeiling: Number,
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);
