import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  status: string;
  joiningDate?: Date;
  reportingTo?: mongoose.Types.ObjectId;
  employeeType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    employeeId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    location: { type: String, default: 'Head Office - Ahmedabad' },
    status: { type: String, default: 'active', enum: ['active', 'inactive', 'resigned'] },
    joiningDate: Date,
    reportingTo: { type: Schema.Types.ObjectId, ref: 'Employee' },
    employeeType: { type: String, enum: ['full-time', 'part-time', 'consultant', 'contract'], default: 'full-time' },
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);
