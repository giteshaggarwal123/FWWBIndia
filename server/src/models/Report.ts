import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  name: string;
  type: string;
  project?: mongoose.Types.ObjectId;
  periodStart: Date;
  periodEnd: Date;
  dueDate?: Date;
  generatedBy: mongoose.Types.ObjectId;
  format: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    periodStart: Date,
    periodEnd: Date,
    dueDate: Date,
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    format: { type: String, default: 'pdf', enum: ['pdf', 'excel', 'word', 'csv'] },
  },
  { timestamps: true }
);

export const Report = mongoose.model<IReport>('Report', reportSchema);
