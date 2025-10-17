import mongoose, { Schema, Document } from 'mongoose';

export interface IVisa extends Document {
  country: string;
  requirements: string;
}

const VisaSchema: Schema = new Schema({
  country: { type: String, required: true },
  requirements: { type: String, required: true },
});

export default mongoose.model<IVisa>('Visa', VisaSchema);