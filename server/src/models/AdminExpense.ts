import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminExpense extends Document {
  expenseId: string;
  date: Date;
  category: string;
  description: string;
  amount: number;
  submittedBy: string;
  status: string;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const adminExpenseSchema = new Schema<IAdminExpense>(
  {
    expenseId: { type: String, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    submittedBy: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected', 'settled'] },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const AdminExpense = mongoose.model<IAdminExpense>('AdminExpense', adminExpenseSchema);
