import mongoose, { Schema, Document } from 'mongoose';
import { tenancyPlugin } from '../utils/tenancy';

export interface IDepartment extends Document {
  name: string;
  companyCode: string;
  lead: string;
  memberCount: number;
  aiCount: number;
  progress: number;
  color: string;
}

const DepartmentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    companyCode: { type: String, required: true, default: 'FO-2026-7X4K', index: true },
    lead: { type: String, required: true },
    memberCount: { type: Number, default: 0 },
    aiCount: { type: Number, default: 0 },
    progress: { type: Number, default: 70 },
    color: { type: String, default: '#6366f1' },
  },
  { timestamps: true }
);

DepartmentSchema.index({ companyCode: 1, name: 1 }, { unique: true });

DepartmentSchema.plugin(tenancyPlugin);

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
