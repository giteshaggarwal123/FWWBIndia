import mongoose, { Document, Schema } from 'mongoose';

export interface ILFAProgressEntry extends Document {
  period: string;
  actual: number;
  notes?: string;
}

export interface ILFAObjective extends Document {
  title: string;
  indicators?: string;
  meansOfVerification?: string;
  target?: string;
  baseline?: string;
  frequency?: string;
  progressEntries?: ILFAProgressEntry[];
  outcomes?: ILFAOutcome[];
}

export interface ILFAOutcome extends Document {
  title: string;
  indicators?: string;
  outputs?: ILFAOutput[];
}

export interface ILFAOutput extends Document {
  title: string;
  indicators?: string;
  activities?: ILFAActivity[];
}

export interface ILFAActivity extends Document {
  title: string;
  indicators?: string;
  meansOfVerification?: string;
}

const lfaProgressEntrySchema = new Schema<ILFAProgressEntry>(
  { period: String, actual: Number, notes: String },
  { _id: true }
);
const lfaActivitySchema = new Schema<ILFAActivity>(
  { title: String, indicators: String, meansOfVerification: String },
  { _id: true }
);
const lfaOutputSchema = new Schema<ILFAOutput>(
  { title: String, indicators: String, activities: [lfaActivitySchema] },
  { _id: true }
);
const lfaOutcomeSchema = new Schema<ILFAOutcome>(
  { title: String, indicators: String, outputs: [lfaOutputSchema] },
  { _id: true }
);
const lfaObjectiveSchema = new Schema<ILFAObjective>(
  { title: String, indicators: String, meansOfVerification: String, target: String, baseline: String, frequency: String, progressEntries: [lfaProgressEntrySchema], outcomes: [lfaOutcomeSchema] },
  { _id: true }
);

export interface ILFA extends Document {
  project: mongoose.Types.ObjectId;
  goal: string;
  objectives: mongoose.Types.DocumentArray<ILFAObjective>;
  createdAt: Date;
  updatedAt: Date;
}

const lfaSchema = new Schema<ILFA>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
    goal: { type: String, required: true },
    objectives: [lfaObjectiveSchema],
  },
  { timestamps: true }
);

export const LFA = mongoose.model<ILFA>('LFA', lfaSchema);
