import mongoose, { Document, Schema } from 'mongoose';

export interface ITravelRequest extends Document {
  requestId: string;
  employee: mongoose.Types.ObjectId;
  purposeOfTravel: string;
  from: string;
  to: string;
  travelDate: Date;
  mode: string;
  estimatedCost: number;
  status: string;
  ticketAttachmentId?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const travelSchema = new Schema<ITravelRequest>(
  {
    requestId: { type: String, required: true },
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    purposeOfTravel: { type: String, default: '' },
    from: { type: String, required: true },
    to: { type: String, required: true },
    travelDate: { type: Date, required: true },
    mode: { type: String, required: true, enum: ['flight', 'train', 'bus', 'car'] },
    estimatedCost: { type: Number, default: 0 },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected', 'booked', 'completed'] },
    ticketAttachmentId: { type: Schema.Types.ObjectId, ref: 'FileAttachment' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const TravelRequest = mongoose.model<ITravelRequest>('TravelRequest', travelSchema);
