import mongoose, { Document, Schema } from 'mongoose';

export interface IMonitoringEntry extends Document {
  entryId: string;
  project: mongoose.Types.ObjectId;
  activity?: mongoose.Types.ObjectId;
  location?: string;
  lat?: number;
  lng?: number;
  notes: string;
  collectedBy: mongoose.Types.ObjectId;
  date: Date;
  expectedParticipants?: number;
  actualParticipants?: number;
  achievementRate?: number;
  indicatorsData?: string;
  offlineSynced?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const monitoringSchema = new Schema<IMonitoringEntry>(
  {
    entryId: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    activity: { type: Schema.Types.ObjectId, ref: 'Activity' },
    location: String,
    lat: Number,
    lng: Number,
    notes: { type: String, default: '' },
    collectedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    expectedParticipants: Number,
    actualParticipants: Number,
    achievementRate: Number,
    indicatorsData: String,
    offlineSynced: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MonitoringEntry = mongoose.model<IMonitoringEntry>('MonitoringEntry', monitoringSchema);
