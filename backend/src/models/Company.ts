import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  code: string;
  type: string;
  address: string;
  isOnline: boolean;
  owner: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  coFounders: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
  }>;
}

const CompanySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    type: { type: String, default: 'AI Software & Operating Systems' },
    address: { type: String, default: 'Suite 402, Quantum Tower, Bengaluru, India' },
    isOnline: { type: Boolean, default: true },
    owner: {
      name: { type: String, required: true },
      phone: { type: String, default: '+91 98765 43210' },
      email: { type: String, required: true },
      address: { type: String, default: 'Bengaluru, India' },
    },
    coFounders: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
