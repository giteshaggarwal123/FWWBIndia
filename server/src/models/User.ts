import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type RoleType = 'management' | 'program' | 'hr' | 'admin' | 'employee' | 'donor';

export interface IUser extends Document {
  username: string;
  password: string;
  name: string;
  role: string;
  type: RoleType;
  refreshToken?: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true },
    role: { type: String, required: true },
    type: { type: String, required: true, enum: ['management', 'program', 'hr', 'admin', 'employee', 'donor'] },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
