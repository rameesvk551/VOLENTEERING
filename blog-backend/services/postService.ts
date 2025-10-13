/**
 * Post Service
 * Purpose: Business logic for post operations
 * Architecture: Service layer between controllers and models
 */

import Post, { IPost } from '../models/postModel';
import { generateSlug, generatePostSeoMetadata } from '../utils/seo';
import { NotFoundError, ValidationError } from '../middlewares/errorHandler';

interface PostQuery {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  sort?: 'date' | 'title' | 'popular';
}

interface PaginatedPosts {
  posts: IPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Get all posts with filtering and pagination
 */
export const getAllPosts = async (query: PostQuery): Promise<PaginatedPosts> => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter: any = { isPublished: true };

  if (query.category) {
    filter.categories = query.category;
  }

  if (query.tag) {
    filter.tags = query.tag;
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  // Build sort
  let sort: any = { publishDate: -1 }; // Default: newest first

  if (query.sort === 'title') {
    sort = { title: 1 };
  } else if (query.sort === 'popular') {
    sort = { views: -1 };
  }

  // Execute query
  const [posts, total] = await Promise.all([
    Post.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ]);

  return {
    posts: posts as IPost[],
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

/**
 * Get single post by slug
 */
export const getPostBySlug = async (slug: string): Promise<IPost> => {
  const post = await Post.findOne({ slug, isPublished: true });

  if (!post) {
    throw new NotFoundError(`Post with slug "${slug}" not found`);
  }

  // Increment views
  await post.incrementViews();

  return post;
};

/**
 * Get single post by ID
 */
export const getPostById = async (id: string): Promise<IPost> => {
  const post = await Post.findById(id);

  if (!post) {
    throw new NotFoundError(`Post with ID "${id}" not found`);
  }

  return post;
};

/**
 * Create new post
 */
export const createPost = async (postData: Partial<IPost>): Promise<IPost> => {
  // Generate slug if not provided
  if (!postData.slug && postData.title) {
    postData.slug = generateSlug(postData.title);
  }

  // Check for duplicate slug
  const existing = await Post.findOne({ slug: postData.slug });
  if (existing) {
    throw new ValidationError(`Post with slug "${postData.slug}" already exists`);
  }

  // Generate SEO metadata if not provided
  if (!postData.seoMeta && postData.title && postData.content) {
    const seoMeta = generatePostSeoMetadata(
      {
        title: postData.title,
        slug: postData.slug!,
        content: postData.content,
        summary: postData.summary,
        coverImage: postData.coverImage,
        tags: postData.tags,
        categories: postData.categories,
        publishDate: new Date(),
      } as any,
      process.env.VITE_APP_URL || 'http://localhost:3000'
    );

    postData.seoMeta = {
      title: seoMeta.title,
      description: seoMeta.description,
      keywords: seoMeta.keywords,
    };
  }

  const post = new Post(postData);
  await post.save();

  return post;
};

/**
 * Update post by ID
 */
export const updatePost = async (id: string, postData: Partial<IPost>): Promise<IPost> => {
  const post = await Post.findById(id);

  if (!post) {
    throw new NotFoundError(`Post with ID "${id}" not found`);
  }

  // If slug is being changed, check for duplicates
  if (postData.slug && postData.slug !== post.slug) {
    const existing = await Post.findOne({ slug: postData.slug });
    if (existing) {
      throw new ValidationError(`Post with slug "${postData.slug}" already exists`);
    }
  }

  // Update fields
  Object.assign(post, postData);
  await post.save();

  return post;
};

/**
 * Delete post by ID
 */
export const deletePost = async (id: string): Promise<void> => {
  const post = await Post.findById(id);

  if (!post) {
    throw new NotFoundError(`Post with ID "${id}" not found`);
  }

  await post.deleteOne();
};

/**
 * Get all categories with post counts
 */
export const getCategories = async (): Promise<Array<{ name: string; count: number }>> => {
  const categories = await Post.aggregate([
    { $match: { isPublished: true } },
    { $unwind: '$categories' },
    { $group: { _id: '$categories', count: { $sum: 1 } } },
    { $project: { name: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);

  return categories;
};

/**
 * Get all tags with post counts
 */
export const getTags = async (): Promise<Array<{ name: string; count: number }>> => {
  const tags = await Post.aggregate([
    { $match: { isPublished: true } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $project: { name: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);

  return tags;
};
