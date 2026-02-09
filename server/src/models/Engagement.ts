import mongoose, { Document, Schema } from 'mongoose';

export interface IEngagementSurvey extends Document {
  name: string;
  type: string;
  launchDate: Date;
  responses: number;
  totalEmployees: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const surveySchema = new Schema<IEngagementSurvey>(
  {
    name: { type: String, required: true },
    type: { type: String, default: 'annual' },
    launchDate: { type: Date, default: Date.now },
    responses: { type: Number, default: 0 },
    totalEmployees: { type: Number, default: 0 },
    status: { type: String, default: 'active', enum: ['active', 'completed'] },
  },
  { timestamps: true }
);

export const EngagementSurvey = mongoose.model<IEngagementSurvey>('EngagementSurvey', surveySchema);
