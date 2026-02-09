import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  project: mongoose.Types.ObjectId;
  head: string;
  allocated: number;
  utilized: number;
  financialYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    head: { type: String, required: true },
    allocated: { type: Number, required: true },
    utilized: { type: Number, default: 0 },
    financialYear: { type: String, required: true },
  },
  { timestamps: true }
);

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);
