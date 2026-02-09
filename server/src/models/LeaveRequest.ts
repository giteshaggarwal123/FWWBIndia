import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveRequest extends Document {
  employee: mongoose.Types.ObjectId;
  leaveType: string;
  fromDate: Date;
  toDate: Date;
  days: number;
  reason: string;
  status: string;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new Schema<ILeaveRequest>(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: { type: String, default: '' },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', leaveSchema);
