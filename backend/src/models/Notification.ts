import mongoose, { Schema, Document } from 'mongoose';
import { tenancyPlugin } from '../utils/tenancy';

export interface INotification extends Document {
  timestamp: string;
  companyCode: string;
  title: string;
  message: string;
  type: 'urgent' | 'milestone' | 'review' | 'info';
  read: boolean;
}

const NotificationSchema: Schema = new Schema(
  {
    timestamp: { type: String, required: true },
    companyCode: { type: String, required: true, default: 'FO-2026-7X4K', index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['urgent', 'milestone', 'review', 'info'], default: 'info' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ companyCode: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ companyCode: 1, createdAt: -1 });

NotificationSchema.plugin(tenancyPlugin);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
