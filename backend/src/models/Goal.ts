import mongoose, { Schema, Document } from 'mongoose';
import { tenancyPlugin } from '../utils/tenancy';

export interface IGoal extends Document {
  title: string;
  companyCode: string;
  description: string;
  targetMetric: string;
  currentValue: string;
  targetValue: string;
  progressPercent: number;
  deadline: string;
  ownerName: string;
  ownerRole: string;
  department: string;
  status: 'on_track' | 'at_risk' | 'completed' | 'behind';
  linkedTaskIds: string[];
}

const GoalSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    companyCode: { type: String, required: true, default: 'FO-2026-7X4K', index: true },
    description: { type: String, default: '' },
    targetMetric: { type: String, required: true },
    currentValue: { type: String, required: true },
    targetValue: { type: String, required: true },
    progressPercent: { type: Number, default: 0 },
    deadline: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerRole: { type: String, default: 'Lead' },
    department: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['on_track', 'at_risk', 'completed', 'behind'], 
      default: 'on_track' 
    },
    linkedTaskIds: [{ type: String }],
  },
  { timestamps: true }
);

GoalSchema.index({ companyCode: 1, status: 1 });
GoalSchema.index({ companyCode: 1, department: 1 });

GoalSchema.plugin(tenancyPlugin);

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
