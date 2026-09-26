import mongoose, { Schema, Document } from 'mongoose';
import { tenancyPlugin } from '../utils/tenancy';

export type DealStage = 'LEAD' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface IDeal extends Document {
  title: string;
  companyCode: string;
  clientName: string;
  contactEmail: string;
  value: number;
  stage: DealStage;
  probability: number;
  ownerName: string;
  notes?: string;
  lastContactDate: string;
  followUpRequired: boolean;
  aiRecommendation?: string;
}

const DealSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    companyCode: { type: String, required: true, default: 'FO-2026-7X4K', index: true },
    clientName: { type: String, required: true },
    contactEmail: { type: String, default: '' },
    value: { type: Number, required: true, default: 0 },
    stage: {
      type: String,
      enum: ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'],
      default: 'LEAD',
    },
    probability: { type: Number, default: 50 },
    ownerName: { type: String, default: 'Founder' },
    notes: { type: String, default: '' },
    lastContactDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    followUpRequired: { type: Boolean, default: false },
    aiRecommendation: { type: String, default: '' },
  },
  { timestamps: true }
);

DealSchema.index({ companyCode: 1, stage: 1 });
DealSchema.index({ companyCode: 1, createdAt: -1 });

DealSchema.plugin(tenancyPlugin);

export const Deal = mongoose.model<IDeal>('Deal', DealSchema);
