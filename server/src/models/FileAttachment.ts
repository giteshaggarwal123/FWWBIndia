import mongoose, { Document, Schema } from 'mongoose';

export interface IFileAttachment extends Document {
  originalName: string;
  storedPath: string;
  mimeType: string;
  size: number;
  refModel?: string;
  refId?: string;
  documentType?: string;
  tags?: string[];
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const fileSchema = new Schema<IFileAttachment>(
  {
    originalName: { type: String, required: true },
    storedPath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    refModel: String,
    refId: String,
    documentType: { type: String, enum: ['proposal', 'agreement', 'report', 'audit', 'fcra', 'other'], default: 'other' },
    tags: [{ type: String }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const FileAttachment = mongoose.model<IFileAttachment>('FileAttachment', fileSchema);
