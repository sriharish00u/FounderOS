import mongoose, { Schema, Document } from 'mongoose';
import { tenancyPlugin } from '../utils/tenancy';

export interface ITaskSubmission {
  id: string;
  submittedAt: string;
  submittedBy: string;
  submitterType: 'human' | 'ai';
  deliverableSummary: string;
  attachments?: string[];
  notes?: string;
  reviewStatus?: 'pending' | 'approved' | 'changes_requested';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface ITaskActivityLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
}

export interface ITask extends Document {
  title: string;
  companyCode: string;
  description: string;
  creatorId: string;
  creatorName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeType: 'human' | 'ai';
  assigneeAvatar?: string;
  assigneeRole: string;
  department: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEW' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';
  deadline: string;
  goalId?: string;
  goalTitle?: string;
  submissions: ITaskSubmission[];
  activityLogs: ITaskActivityLog[];
}

const TaskSubmissionSchema = new Schema(
  {
    id: { type: String, required: true },
    submittedAt: { type: String, required: true },
    submittedBy: { type: String, required: true },
    submitterType: { type: String, enum: ['human', 'ai'], required: true },
    deliverableSummary: { type: String, required: true },
    attachments: [{ type: String }],
    notes: { type: String },
    reviewStatus: { type: String, enum: ['pending', 'approved', 'changes_requested'], default: 'pending' },
    reviewedBy: { type: String },
    reviewedAt: { type: String },
    reviewNotes: { type: String },
  },
  { _id: false }
);

const TaskActivityLogSchema = new Schema(
  {
    id: { type: String, required: true },
    timestamp: { type: String, required: true },
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
  },
  { _id: false }
);

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    companyCode: { type: String, required: true, default: 'FO-2026-7X4K', index: true },
    description: { type: String, default: '' },
    creatorId: { type: String, default: 'user-founder' },
    creatorName: { type: String, default: 'Founder' },
    assigneeId: { type: String, required: true },
    assigneeName: { type: String, required: true },
    assigneeType: { type: String, enum: ['human', 'ai'], required: true },
    assigneeAvatar: { type: String },
    assigneeRole: { type: String, default: 'Staff' },
    department: { type: String, required: true },
    priority: { 
      type: String, 
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], 
      default: 'MEDIUM' 
    },
    status: { 
      type: String, 
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'REVIEW', 'COMPLETED', 'BLOCKED', 'CANCELLED'], 
      default: 'NOT_STARTED' 
    },
    deadline: { type: String, required: true },
    goalId: { type: String },
    goalTitle: { type: String },
    submissions: [TaskSubmissionSchema],
    activityLogs: [TaskActivityLogSchema],
  },
  { timestamps: true }
);

TaskSchema.index({ companyCode: 1, status: 1 });
TaskSchema.index({ companyCode: 1, assigneeId: 1, status: 1 });
TaskSchema.index({ companyCode: 1, createdAt: -1 });
TaskSchema.index({ companyCode: 1, goalId: 1 });
TaskSchema.index({ companyCode: 1, department: 1 });

TaskSchema.plugin(tenancyPlugin);

export const Task = mongoose.model<ITask>('Task', TaskSchema);
