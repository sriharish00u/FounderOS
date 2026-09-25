import mongoose, { Schema, Document } from 'mongoose';
import { tenancyPlugin } from '../utils/tenancy';

export interface IActivity extends Document {
  timestamp: string;
  companyCode: string;
  actorName: string;
  actorType: 'human' | 'ai' | 'founder';
  actorAvatar?: string;
  action: string;
  target: string;
  category: 'task' | 'goal' | 'hire' | 'review' | 'system';
}

const ActivitySchema: Schema = new Schema(
  {
    timestamp: { type: String, required: true },
    companyCode: { type: String, required: true, default: 'FO-2026-7X4K', index: true },
    actorName: { type: String, required: true },
    actorType: { type: String, enum: ['human', 'ai', 'founder'], required: true },
    actorAvatar: { type: String },
    action: { type: String, required: true },
    target: { type: String, required: true },
    category: { type: String, enum: ['task', 'goal', 'hire', 'review', 'system'], default: 'task' },
  },
  { timestamps: true }
);

ActivitySchema.index({ companyCode: 1, createdAt: -1 });
ActivitySchema.index({ companyCode: 1, category: 1 });

ActivitySchema.plugin(tenancyPlugin);

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
