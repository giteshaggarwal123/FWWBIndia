import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  activityId: string;
  name: string;
  project: mongoose.Types.ObjectId;
  budget: number;
  startDate?: string;
  endDate?: string;
  status: string;
  quarter?: string;
  location?: string;
  expectedParticipants?: number;
  actualParticipants?: number;
  achievementRate?: number;
  trainingDays?: number;
  budgetHead?: string;
  lfaObjectiveRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    activityId: { type: String, required: true },
    name: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    budget: { type: Number, default: 0 },
    startDate: String,
    endDate: String,
    status: { type: String, default: 'planned', enum: ['planned', 'in-progress', 'completed', 'delayed'] },
    quarter: String,
    location: String,
    expectedParticipants: Number,
    actualParticipants: Number,
    achievementRate: Number,
    trainingDays: Number,
    budgetHead: String,
    lfaObjectiveRef: String,
  },
  { timestamps: true }
);

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
