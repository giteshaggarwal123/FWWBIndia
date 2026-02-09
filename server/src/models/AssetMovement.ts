import mongoose, { Document, Schema } from 'mongoose';

export interface IAssetMovement extends Document {
  asset: mongoose.Types.ObjectId;
  action: string;
  fromEmployee?: mongoose.Types.ObjectId;
  toEmployee?: mongoose.Types.ObjectId;
  fromLocation?: string;
  toLocation?: string;
  notes?: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const movementSchema = new Schema<IAssetMovement>(
  {
    asset: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    action: { type: String, required: true, enum: ['assigned', 'returned', 'transferred', 'repaired', 'scrapped'] },
    fromEmployee: { type: Schema.Types.ObjectId, ref: 'Employee' },
    toEmployee: { type: Schema.Types.ObjectId, ref: 'Employee' },
    fromLocation: String,
    toLocation: String,
    notes: String,
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const AssetMovement = mongoose.model<IAssetMovement>('AssetMovement', movementSchema);
