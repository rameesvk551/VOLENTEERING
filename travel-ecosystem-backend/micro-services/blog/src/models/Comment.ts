import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  blogId: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  content: string;
  parentCommentId?: string; // For nested comments
  likes: string[]; // User IDs who liked
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    blogId: {
      type: String,
      required: true,
      index: true
    },
    user: {
      id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      profileImage: String
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      minlength: [1, 'Comment must be at least 1 character'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    parentCommentId: {
      type: String,
      default: null
    },
    likes: {
      type: [String],
      default: []
    },
    isApproved: {
      type: Boolean,
      default: true // Auto-approve by default
    }
  },
  {
    timestamps: true
  }
);

// Indexes
commentSchema.index({ blogId: 1, createdAt: -1 });
commentSchema.index({ 'user.id': 1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
