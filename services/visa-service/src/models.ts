import { Schema, model, Document } from 'mongoose';

export interface SourceInfo {
  name: string;
  url: string;
  retrievedAt: string;
}

export interface VisaRule extends Document {
  from: string;
  to: string;
  status: 'visa-free' | 'eVisa' | 'VoA' | 'eTA' | 'visa-required';
  duration?: string;
  notes?: string;
  applyUrl?: string;
  docsRequired?: string[];
  sources: SourceInfo[];
  confidenceScore: number;
  lastUpdated: string;
}

const SourceInfoSchema = new Schema<SourceInfo>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  retrievedAt: { type: String, required: true },
}, { _id: false });

const VisaRuleSchema = new Schema<VisaRule>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  status: { type: String, required: true, enum: ['visa-free', 'eVisa', 'VoA', 'eTA', 'visa-required'] },
  duration: String,
  notes: String,
  applyUrl: String,
  docsRequired: [String],
  sources: { type: [SourceInfoSchema], required: true },
  confidenceScore: { type: Number, required: true },
  lastUpdated: { type: String, required: true },
});

export const VisaRuleModel = model<VisaRule>('VisaRule', VisaRuleSchema);
