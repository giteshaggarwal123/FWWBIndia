import mongoose, { Document, Schema } from 'mongoose';

export interface IInsuranceFamilyMember {
  name: string;
  dateOfBirth?: Date;
  relationship: string;
  coverageAmount?: number;
}

export interface IInsurancePolicy extends Document {
  policyNumber: string;
  type: string;
  provider: string;
  startDate: Date;
  endDate: Date;
  sumInsured?: number;
  premium?: number;
  status: string;
  employeeId?: string;
  employeeName?: string;
  dateOfBirth?: Date;
  familyMembers?: IInsuranceFamilyMember[];
  vehicleNumber?: string;
  vehicleType?: string;
  officeLocation?: string;
  equipmentCovered?: string;
  coverageType?: string;
  insuredDirectorsList?: string;
  createdAt: Date;
  updatedAt: Date;
}

const familyMemberSchema = new Schema(
  { name: String, dateOfBirth: Date, relationship: String, coverageAmount: Number },
  { _id: false }
);

const policySchema = new Schema<IInsurancePolicy>(
  {
    policyNumber: { type: String, required: true },
    type: { type: String, required: true, enum: ['medical', 'group-accident', 'vehicle', 'fire-safety', 'd-and-o'] },
    provider: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    sumInsured: Number,
    premium: Number,
    status: { type: String, default: 'active' },
    employeeId: String,
    employeeName: String,
    dateOfBirth: Date,
    familyMembers: [familyMemberSchema],
    vehicleNumber: String,
    vehicleType: String,
    officeLocation: String,
    equipmentCovered: String,
    coverageType: String,
    insuredDirectorsList: String,
  },
  { timestamps: true }
);

export const InsurancePolicy = mongoose.model<IInsurancePolicy>('InsurancePolicy', policySchema);
