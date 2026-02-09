import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  expenseId: string;
  project: mongoose.Types.ObjectId;
  activity?: mongoose.Types.ObjectId;
  amount: number;
  category: string;
  budgetHead?: string;
  description: string;
  date: Date;
  submittedBy: mongoose.Types.ObjectId;
  status: string;
  approvedBy?: mongoose.Types.ObjectId;
  paymentDate?: Date;
  voucherNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    expenseId: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    activity: { type: Schema.Types.ObjectId, ref: 'Activity' },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    budgetHead: String,
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'submitted', enum: ['submitted', 'verified', 'approved', 'rejected', 'settled'] },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    paymentDate: Date,
    voucherNumber: String,
  },
  { timestamps: true }
);

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
