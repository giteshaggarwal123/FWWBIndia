import mongoose, { Document, Schema } from 'mongoose';

/** Grant / funding commitment: donor funds a project for a period and amount. */
export interface IGrant extends Document {
  donor: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const grantSchema = new Schema<IGrant>(
  {
    donor: { type: Schema.Types.ObjectId, ref: 'Donor', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    amount: { type: Number, required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    status: { type: String, default: 'active', enum: ['active', 'completed', 'cancelled'] },
    notes: String,
  },
  { timestamps: true }
);

export const Grant = mongoose.model<IGrant>('Grant', grantSchema);
