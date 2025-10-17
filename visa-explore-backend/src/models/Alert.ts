import mongoose, { Document, Schema } from 'mongoose';

export type AlertType = 'visa-change' | 'price-drop' | 'new-route' | 'restriction-lifted';
export type NotificationChannel = 'email' | 'whatsapp' | 'push' | 'sms';

export interface IAlertFilters {
  origin?: string; // Country code
  destinations?: string[]; // Country codes
  regions?: string[]; // e.g., 'Europe', 'Asia'
  visaTypes?: string[]; // e.g., 'visa-free', 'evisa'
}

export interface IAlert extends Document {
  userId: mongoose.Types.ObjectId | string;
  alertType: AlertType;
  filters: IAlertFilters;
  notificationChannels: NotificationChannel[];
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'User',
    },
    alertType: {
      type: String,
      enum: ['visa-change', 'price-drop', 'new-route', 'restriction-lifted'],
      required: true,
    },
    filters: {
      origin: {
        type: String,
        uppercase: true,
        trim: true,
      },
      destinations: {
        type: [String],
        default: [],
      },
      regions: {
        type: [String],
        default: [],
      },
      visaTypes: {
        type: [String],
        enum: ['visa-free', 'voa', 'evisa', 'visa-required'],
        default: [],
      },
    },
    notificationChannels: {
      type: [String],
      enum: ['email', 'whatsapp', 'push', 'sms'],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'At least one notification channel is required',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastTriggered: {
      type: Date,
    },
    triggerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes
AlertSchema.index({ userId: 1, isActive: 1 });
AlertSchema.index({ alertType: 1, isActive: 1 });
AlertSchema.index({ 'filters.origin': 1, isActive: 1 });

// Method to increment trigger count
AlertSchema.methods.recordTrigger = function () {
  this.lastTriggered = new Date();
  this.triggerCount += 1;
  return this.save();
};

// Method to check if alert should be rate-limited (max 1 per day for same alert)
AlertSchema.methods.shouldRateLimit = function (): boolean {
  if (!this.lastTriggered) return false;

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  return this.lastTriggered > oneDayAgo;
};

const Alert = mongoose.model<IAlert>('Alert', AlertSchema);

export default Alert;
