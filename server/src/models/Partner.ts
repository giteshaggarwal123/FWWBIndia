import mongoose, { Document, Schema } from 'mongoose';

/** Sub-grantee / partner foundation (e.g. Supraja Foundation) that FWWB works with */
export interface IPartner extends Document {
  name: string;
  code?: string;
  type: string;
  location?: string;
  contactEmail?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const partnerSchema = new Schema<IPartner>(
  {
    name: { type: String, required: true },
    code: String,
    type: { type: String, default: 'sub-grantee', enum: ['sub-grantee', 'partner', 'implementing'] },
    location: String,
    contactEmail: String,
    status: { type: String, default: 'active' },
  },
  { timestamps: true }
);

export const Partner = mongoose.model<IPartner>('Partner', partnerSchema);
