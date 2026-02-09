import mongoose, { Document, Schema } from 'mongoose';

export interface IStationeryRequest extends Document {
  requestId: string;
  requestedBy: mongoose.Types.ObjectId;
  department: string;
  purpose: string;
  items: string;
  quantity: string;
  dateNeeded: Date;
  date: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const stationerySchema = new Schema<IStationeryRequest>(
  {
    requestId: { type: String, required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String, required: true },
    purpose: { type: String, default: 'general', enum: ['training', 'workshop', 'general'] },
    items: { type: String, required: true },
    quantity: { type: String, required: true },
    dateNeeded: Date,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected', 'fulfilled'] },
  },
  { timestamps: true }
);

export const StationeryRequest = mongoose.model<IStationeryRequest>('StationeryRequest', stationerySchema);
