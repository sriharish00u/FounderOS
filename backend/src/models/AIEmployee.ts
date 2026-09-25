import mongoose, { Schema } from 'mongoose';
import { tenancyPlugin } from '../utils/tenancy';

export interface IAIMemory {
  identitySummary: string;
  responsibilities: string[];
  companyContext: string;
  instructions: string;
  preferences: string[];
  keyLearnings: string[];
  previousOutputsSummary: string;
  tokenCount: number;
  lastUpdated: string;
}

export interface IAIEmployeeCipher {
  iv: string;
  tag: string;
  data: string;
}

export interface IAIEmployee {
  name: string;
  companyCode: string;
  role: string;
  department: string;
  departmentId?: string;
  managerId?: string;
  managerName: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Groq' | 'Ollama' | 'Custom';
  model: string;
  fallbackModel?: string;
  fallbackModels?: string[];
  apiEndpoint?: string;
  apiKeyCipher?: IAIEmployeeCipher;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'idle' | 'running' | 'completed_recent' | 'error';
  avatar: string;
  permissions: string[];
  memory: IAIMemory;
  tasksCompleted: number;
  tasksRunning: number;
  successRate: number;
  lastActive: string;
}

const AIMemorySchema = new Schema(
  {
    identitySummary: { type: String, default: '' },
    responsibilities: [{ type: String }],
    companyContext: { type: String, default: '' },
    instructions: { type: String, default: '' },
    preferences: [{ type: String }],
    keyLearnings: [{ type: String }],
    previousOutputsSummary: { type: String, default: '' },
    tokenCount: { type: Number, default: 1000 },
    lastUpdated: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const AIEmployeeSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    companyCode: { type: String, required: true, default: 'FO-2026-7X4K', index: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    departmentId: { type: String },
    managerId: { type: String },
    managerName: { type: String, required: true },
    provider: { 
      type: String, 
      enum: ['OpenAI', 'Anthropic', 'Google', 'Groq', 'Ollama', 'Custom'], 
      default: 'Anthropic' 
    },
    model: { type: String, required: true },
    fallbackModel: { type: String },
    fallbackModels: [{ type: String }],
    apiEndpoint: { type: String },
    apiKeyCipher: {
      iv: { type: String },
      tag: { type: String },
      data: { type: String },
    },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'HIGH' },
    status: { 
      type: String, 
      enum: ['idle', 'running', 'completed_recent', 'error'], 
      default: 'idle' 
    },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150' },
    permissions: [{ type: String }],
    memory: { type: AIMemorySchema, default: () => ({}) },
    tasksCompleted: { type: Number, default: 0 },
    tasksRunning: { type: Number, default: 0 },
    successRate: { type: Number, default: 98 },
    lastActive: { type: String, default: 'Just now' },
  },
  { timestamps: true }
);

AIEmployeeSchema.index({ companyCode: 1, status: 1 });
AIEmployeeSchema.index({ companyCode: 1, department: 1 });

AIEmployeeSchema.plugin(tenancyPlugin);

export const AIEmployee = mongoose.model<IAIEmployee>('AIEmployee', AIEmployeeSchema);
