import mongoose, { Schema, Document } from 'mongoose';
import { tenancyPlugin } from '../utils/tenancy';

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Subscription / MRR'
  | 'Services / Deals'
  | 'Payroll'
  | 'Cloud & Compute'
  | 'AI APIs'
  | 'Marketing'
  | 'Operations'
  | 'Other';

export interface IFinanceTransaction extends Document {
  companyCode: string;
  title: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  date: string;
  status: 'cleared' | 'pending';
  account?: string;
  notes?: string;
}

const FinanceTransactionSchema: Schema = new Schema(
  {
    companyCode: { type: String, required: true, default: 'FO-2026-7X4K', index: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: [
        'Subscription / MRR',
        'Services / Deals',
        'Payroll',
        'Cloud & Compute',
        'AI APIs',
        'Marketing',
        'Operations',
        'Other',
      ],
      default: 'Operations',
    },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { type: String, enum: ['cleared', 'pending'], default: 'cleared' },
    account: { type: String, default: 'Primary Operating (HDFC)' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

FinanceTransactionSchema.index({ companyCode: 1, type: 1 });
FinanceTransactionSchema.index({ companyCode: 1, date: -1 });
FinanceTransactionSchema.index({ companyCode: 1, category: 1 });

FinanceTransactionSchema.plugin(tenancyPlugin);

export const FinanceTransaction = mongoose.model<IFinanceTransaction>(
  'FinanceTransaction',
  FinanceTransactionSchema
);
