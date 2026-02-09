import mongoose, { Document, Schema } from 'mongoose';

export interface IPayrollRun extends Document {
  month: number;
  year: number;
  totalAmount: number;
  payslipCount: number;
  status: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const payrollSchema = new Schema<IPayrollRun>(
  {
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    totalAmount: { type: Number, default: 0 },
    payslipCount: { type: Number, default: 0 },
    status: { type: String, default: 'draft', enum: ['draft', 'processed'] },
    processedAt: Date,
  },
  { timestamps: true }
);

export const PayrollRun = mongoose.model<IPayrollRun>('PayrollRun', payrollSchema);
