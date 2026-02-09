import mongoose, { Document, Schema } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  type: string;
  date: Date;
  location?: string;
  participants?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<ICalendarEvent>(
  {
    title: { type: String, required: true },
    type: { type: String, default: 'event', enum: ['event', 'holiday', 'birthday', 'anniversary'] },
    date: { type: Date, required: true },
    location: String,
    participants: String,
    status: { type: String, default: 'confirmed', enum: ['planned', 'confirmed', 'cancelled'] },
  },
  { timestamps: true }
);

export const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', eventSchema);
