import mongoose, { Schema, Document } from 'mongoose';
import { tenancyPlugin } from '../utils/tenancy';

export interface IEmployee extends Document {
  name: string;
  companyCode: string;
  email: string;
  phone: string;
  role: string;
  roleId?: string;
  department: string;
  departmentId?: string;
  managerId?: string;
  managerName?: string;
  employeeCode: string;
  avatar: string;
  status: 'active' | 'invited' | 'onboarding';
  joinedDate: string;
  address?: string;
  tasksCompleted: number;
  tasksInProgress: number;
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

const EmployeeSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    companyCode: { type: String, required: true, default: 'FO-2026-7X4K', index: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    roleId: { type: String },
    department: { type: String, required: true },
    departmentId: { type: String },
    managerId: { type: String },
    managerName: { type: String },
    employeeCode: { type: String, required: true, unique: true },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    status: { type: String, enum: ['active', 'invited', 'onboarding'], default: 'active' },
    joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    address: { type: String, default: 'Bengaluru, India' },
    tasksCompleted: { type: Number, default: 0 },
    tasksInProgress: { type: Number, default: 0 },
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

EmployeeSchema.index({ companyCode: 1, status: 1 });
EmployeeSchema.index({ companyCode: 1, department: 1 });

EmployeeSchema.plugin(tenancyPlugin);

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
