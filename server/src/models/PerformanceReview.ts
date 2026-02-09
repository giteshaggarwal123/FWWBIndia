import mongoose, { Document, Schema } from 'mongoose';

export interface IPerformanceReview extends Document {
  employee: mongoose.Types.ObjectId;
  period: string;
  reviewer: mongoose.Types.ObjectId;
  selfAssessment: string;
  status: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IPerformanceReview>(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    period: { type: String, required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    selfAssessment: { type: String, default: 'pending' },
    status: { type: String, default: 'pending', enum: ['pending', 'completed'] },
    rating: Number,
  },
  { timestamps: true }
);

export const PerformanceReview = mongoose.model<IPerformanceReview>('PerformanceReview', reviewSchema);
