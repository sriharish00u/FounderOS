import mongoose, { Schema, Document } from 'mongoose';
import { tenancyPlugin } from '../utils/tenancy';

export interface IRole extends Document {
  name: string;
  companyCode: string;
  description: string;
  department: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  responsibilities: string[];
  permissions: string[];
  memberCount: number;
}

const RoleSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    companyCode: { type: String, required: true, default: 'FO-2026-7X4K', index: true },
    description: { type: String, default: '' },
    department: { type: String, required: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    responsibilities: [{ type: String }],
    permissions: [{ type: String }],
    memberCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

RoleSchema.plugin(tenancyPlugin);

export const Role = mongoose.model<IRole>('Role', RoleSchema);
