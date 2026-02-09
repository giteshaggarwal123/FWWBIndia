import mongoose, { Document, Schema } from 'mongoose';

/** Single-document org profile for Settings (FWWB name, address, current FY, etc.). */
export interface IOrganizationSettings extends Document {
  name: string;
  shortName: string;
  tagline?: string;
  address?: string;
  city?: string;
  email?: string;
  phone?: string;
  website?: string;
  financialYearStart: string; // e.g. 'April - March'
  currentFY: string;         // e.g. '2024-25'
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IOrganizationSettings>(
  {
    name: { type: String, required: true, default: "Friends of Women's World Banking India" },
    shortName: { type: String, required: true, default: 'FWWB India' },
    tagline: String,
    address: String,
    city: String,
    email: String,
    phone: String,
    website: String,
    financialYearStart: { type: String, default: 'April - March' },
    currentFY: { type: String, required: true, default: '2024-25' },
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

export const OrganizationSettings = mongoose.model<IOrganizationSettings>('OrganizationSettings', schema);
