import mongoose, { Document, Schema } from 'mongoose';

export interface IAsset extends Document {
  assetNumber: string;
  name: string;
  category: string;
  type: string;
  purchasedDate?: Date;
  warrantyExpiry?: Date;
  cost?: number;
  assignedTo?: mongoose.Types.ObjectId;
  status: string;
  location?: string;
  vendorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    assetNumber: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, required: true, enum: ['it', 'non-it'] },
    purchasedDate: Date,
    warrantyExpiry: Date,
    cost: Number,
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, default: 'active', enum: ['active', 'in-repair', 'scrapped'] },
    location: String,
    vendorName: String,
  },
  { timestamps: true }
);

export const Asset = mongoose.model<IAsset>('Asset', assetSchema);
