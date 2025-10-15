import mongoose, { Document, Schema } from 'mongoose';

export interface IDestination {
  country: string; // Country code (ISO Alpha-3)
  visaType?: string;
  notes?: string;
  priority?: number; // 1-5 scale
}

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId | string;
  planName: string;
  description?: string;
  destinations: IDestination[];
  tags?: string[];
  isPublic: boolean;
  travelDates?: {
    startDate?: Date;
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'User',
    },
    planName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    destinations: [
      {
        country: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
        },
        visaType: {
          type: String,
          enum: ['visa-free', 'voa', 'evisa', 'visa-required', 'closed'],
        },
        notes: {
          type: String,
          maxlength: 200,
        },
        priority: {
          type: Number,
          min: 1,
          max: 5,
          default: 3,
        },
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    travelDates: {
      startDate: Date,
      endDate: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient user queries
BookmarkSchema.index({ userId: 1, createdAt: -1 });
BookmarkSchema.index({ userId: 1, planName: 1 });
BookmarkSchema.index({ tags: 1 });

// Virtual for destination count
BookmarkSchema.virtual('destinationCount').get(function () {
  return this.destinations.length;
});

// Method to check if travel dates are in the past
BookmarkSchema.methods.isPastTrip = function (): boolean {
  if (!this.travelDates?.endDate) return false;
  return this.travelDates.endDate < new Date();
};

// Method to check if trip is upcoming
BookmarkSchema.methods.isUpcoming = function (): boolean {
  if (!this.travelDates?.startDate) return false;
  return this.travelDates.startDate > new Date();
};

const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema);

export default Bookmark;
