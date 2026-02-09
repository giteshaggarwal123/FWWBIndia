import mongoose, { Document, Schema } from 'mongoose';

/** Donor / funder that funds programs. Linked to projects via project.donor (name or code). */
export interface IDonor extends Document {
  name: string;
  code?: string;
  type: string;
  contactPerson?: string;
  contactEmail?: string;
  address?: string;
  status: string;
  reportingFrequency?: string;
  agreementAttachmentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const donorSchema = new Schema<IDonor>(
  {
    name: { type: String, required: true },
    code: String,
    type: { type: String, default: 'institutional', enum: ['institutional', 'individual', 'foundation', 'government'] },
    contactPerson: String,
    contactEmail: String,
    address: String,
    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
    reportingFrequency: String,
    agreementAttachmentId: { type: Schema.Types.ObjectId, ref: 'FileAttachment' },
  },
  { timestamps: true }
);

export const Donor = mongoose.model<IDonor>('Donor', donorSchema);
