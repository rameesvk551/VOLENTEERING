import mongoose, { Document, Schema } from 'mongoose';

export interface IRating extends Document {
  blogId: string;
  userId: string;
  rating: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    blogId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

// Ensure one rating per user per blog
ratingSchema.index({ blogId: 1, userId: 1 }, { unique: true });

export const Rating = mongoose.model<IRating>('Rating', ratingSchema);
