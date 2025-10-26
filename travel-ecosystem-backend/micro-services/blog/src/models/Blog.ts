import mongoose, { Document, Schema } from 'mongoose';
import slug from 'slug';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: string[]; // User IDs who liked
  averageRating: number;
  totalRatings: number;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  publishedAt?: Date;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [100, 'Content must be at least 100 characters']
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    featuredImage: {
      type: String,
      required: [true, 'Featured image is required']
    },
    author: {
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
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Travel Tips',
        'Destinations',
        'Adventure',
        'Culture',
        'Food & Drink',
        'Budget Travel',
        'Luxury Travel',
        'Solo Travel',
        'Family Travel',
        'Volunteering',
        'Travel Gear',
        'Photography',
        'Other'
      ]
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: [String],
      default: []
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String]
    },
    publishedAt: Date,
    isPublished: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Generate slug before saving
blogSchema.pre('save', async function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slug(this.title) + '-' + Date.now();
  }
  
  // Update publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    this.isPublished = true;
  }
  
  next();
});

// Indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ views: -1 });
blogSchema.index({ averageRating: -1 });
blogSchema.index({ 'author.id': 1 });

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);
