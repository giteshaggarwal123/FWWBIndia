import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: string;
  lat?: number;
  lng?: number;
  checkOutLat?: number;
  checkOutLng?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    checkIn: Date,
    checkOut: Date,
    status: { type: String, default: 'present', enum: ['present', 'absent', 'leave', 'half-day', 'wfh'] },
    lat: Number,
    lng: Number,
    checkOutLat: Number,
    checkOutLng: Number,
    notes: String,
  },
  { timestamps: true }
);

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
