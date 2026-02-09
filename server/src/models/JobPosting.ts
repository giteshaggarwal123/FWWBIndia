import mongoose, { Document, Schema } from 'mongoose';

export interface IJobPosting extends Document {
  title: string;
  department: string;
  location: string;
  postedOn: Date;
  applications: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJobPosting>(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    postedOn: { type: Date, default: Date.now },
    applications: { type: Number, default: 0 },
    status: { type: String, default: 'active', enum: ['active', 'closed'] },
  },
  { timestamps: true }
);

export const JobPosting = mongoose.model<IJobPosting>('JobPosting', jobSchema);
