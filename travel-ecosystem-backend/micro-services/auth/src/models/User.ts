import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'super_admin' | 'host';
  isEmailVerified: boolean;
  profileImage?: string;
  phone?: string;
  bio?: string;
  location?: string;
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  refreshTokens: string[];
  lastLogin?: Date;
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin', 'host'],
      default: 'user'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    profileImage: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    preferences: {
      newsletter: {
        type: Boolean,
        default: true
      },
      notifications: {
        type: Boolean,
        default: true
      }
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    refreshTokens: [String],
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
