import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user' | 'host' | 'volunteer';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  lastLogin?: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'host', 'volunteer'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  avatar: String,
  lastLogin: Date,
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);
