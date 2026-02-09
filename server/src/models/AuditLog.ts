import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  userId: string;
  userName?: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    userId: { type: String, required: true },
    userName: String,
    entityType: String,
    entityId: String,
    details: String,
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
