/**
 * Post Model
 * Purpose: Mongoose schema and model for blog posts
 * Architecture: MongoDB document model with validation
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript interface for Post document
export interface IPost extends Document {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage?: string;
  tags: string[];
  categories: string[];
  publishDate: Date;
  updatedAt: Date;
  postedBy: string;
  seoMeta: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
  };
  isPublished: boolean;
  views: number;
}

// Mongoose schema definition
const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'],
      index: true,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [500, 'Summary cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    coverImage: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    categories: {
      type: [String],
      default: [],
      index: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    postedBy: {
      type: String,
      default: 'admin',
      required: true,
    },
    seoMeta: {
      title: String,
      description: String,
      keywords: [String],
      canonical: String,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
PostSchema.index({ title: 'text', content: 'text', summary: 'text' }); // Full-text search
PostSchema.index({ publishDate: -1 }); // Sort by date descending
PostSchema.index({ slug: 1, isPublished: 1 }); // Compound index for lookups

// Virtual for reading time (based on content length)
PostSchema.virtual('readingTime').get(function () {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save hook: Auto-generate slug if not provided
PostSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Static method: Find published posts
PostSchema.statics.findPublished = function () {
  return this.find({ isPublished: true }).sort({ publishDate: -1 });
};

// Static method: Find by slug
PostSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isPublished: true });
};

// Instance method: Increment views
PostSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Model
const Post: Model<IPost> = mongoose.model<IPost>('Post', PostSchema);

export default Post;