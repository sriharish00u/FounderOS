import mongoose, { Schema, Document } from 'mongoose';
import { tenancyPlugin } from '../utils/tenancy';

export interface IUser extends Document {
  email: string;
  phone?: string;
  password?: string;
  name: string;
  role: 'founder' | 'co_founder' | 'manager' | 'employee' | 'ai';
  companyCode: string;
  department?: string;
  departmentId?: string;
  status: 'active' | 'invited' | 'onboarding';
  mustChangePassword?: boolean;
  level?: string;
  bio?: string;
  skills?: string[];
  profile?: {
    dob?: string;
    gender?: string;
    city?: string;
    altPhone?: string;
    personalEmail?: string;
    address?: string;
  };
  preferences?: {
    avatar?: string;
    notifications?: string;
    workMode?: string;
  };
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String },
    name: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['founder', 'co_founder', 'manager', 'employee', 'ai'], 
      default: 'employee' 
    },
    companyCode: { type: String, default: 'FO-2026-7X4K' },
    department: { type: String },
    departmentId: { type: String },
    status: { 
      type: String, 
      enum: ['active', 'invited', 'onboarding'], 
      default: 'active' 
    },
    mustChangePassword: { type: Boolean, default: false },
    level: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    profile: {
      dob: { type: String },
      gender: { type: String },
      city: { type: String },
      altPhone: { type: String },
      personalEmail: { type: String },
      address: { type: String }
    },
    preferences: {
      avatar: { type: String },
      notifications: { type: String },
      workMode: { type: String }
    },
  },
  { timestamps: true }
);

UserSchema.plugin(tenancyPlugin);

export const User = mongoose.model<IUser>('User', UserSchema);
