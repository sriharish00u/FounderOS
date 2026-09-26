import mongoose, { Schema, Document } from 'mongoose';
import { tenancyPlugin } from '../utils/tenancy';

export type DecisionCategory = 'Strategy' | 'Product' | 'Hiring' | 'Finance' | 'Architecture';

export interface IDecision extends Document {
  companyCode: string;
  title: string;
  category: DecisionCategory;
  context: string;
  decision: string;
  rationale: string;
  impact: string;
  stakeholders: string[];
  date: string;
  status: 'active' | 'superseded' | 'under_review';
  ownerName: string;
}

const DecisionSchema: Schema = new Schema(
  {
    companyCode: { type: String, required: true, default: 'FO-2026-7X4K', index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['Strategy', 'Product', 'Hiring', 'Finance', 'Architecture'],
      default: 'Strategy',
    },
    context: { type: String, required: true },
    decision: { type: String, required: true },
    rationale: { type: String, required: true },
    impact: { type: String, default: '' },
    stakeholders: [{ type: String }],
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: {
      type: String,
      enum: ['active', 'superseded', 'under_review'],
      default: 'active',
    },
    ownerName: { type: String, default: 'Founder' },
  },
  { timestamps: true }
);

DecisionSchema.index({ companyCode: 1, status: 1 });
DecisionSchema.index({ companyCode: 1, date: -1 });

DecisionSchema.plugin(tenancyPlugin);

export const Decision = mongoose.model<IDecision>('Decision', DecisionSchema);
