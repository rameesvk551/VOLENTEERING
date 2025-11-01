import { Request, Response, NextFunction } from 'express';
import { Blog } from '../models/Blog.js';
import { Rating } from '../models/Rating.js';

// @route   GET /api/blog
// @desc    Get all published blogs with pagination, search, and filters
// @access  Public
export const getAllBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      tags,
      sort = '-createdAt',
      featured
    } = req.query;

    const query: any = { status: 'published', isPublished: true };

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Tags filter
    if (tags) {
      const tagsArray = typeof tags === 'string' ? tags.split(',') : tags;
      query.tags = { $in: tagsArray };
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .select('-content'),
      Blog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalBlogs: total,
          limit: limitNum
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   GET /api/blog/:slug
// @desc    Get single blog by slug
// @access  Public
export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: 'published' });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: { blog }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   GET /api/blog/id/:id
// @desc    Get single blog by ID
// @access  Public
export const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      data: { blog }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   GET /api/blog/category/:category
// @desc    Get blogs by category
// @access  Public
export const getBlogsByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find({ category, status: 'published' })
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .select('-content'),
      Blog.countDocuments({ category, status: 'published' })
    ]);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalBlogs: total,
          limit: limitNum
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   GET /api/blog/featured
// @desc    Get featured blogs
// @access  Public
export const getFeaturedBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.find({ 
      status: 'published', 
      isFeatured: true 
    })
      .sort('-createdAt')
      .limit(parseInt(limit as string))
      .select('-content');

    res.json({
      success: true,
      data: { blogs }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   GET /api/blog/popular
// @desc    Get popular blogs (by views)
// @access  Public
export const getPopularBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10 } = req.query;

    const blogs = await Blog.find({ status: 'published' })
      .sort('-views')
      .limit(parseInt(limit as string))
      .select('-content');

    res.json({
      success: true,
      data: { blogs }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   GET /api/blog/trending
// @desc    Get trending blogs (by recent views and ratings)
// @access  Public
export const getTrendingBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10 } = req.query;

    // Get blogs from last 30 days sorted by views and ratings
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const blogs = await Blog.find({ 
      status: 'published',
      publishedAt: { $gte: thirtyDaysAgo }
    })
      .sort('-views -averageRating')
      .limit(parseInt(limit as string))
      .select('-content');

    res.json({
      success: true,
      data: { blogs }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   POST /api/blog/:id/like
// @desc    Like/Unlike a blog
// @access  Private
export const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const likeIndex = blog.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      // Unlike
      blog.likes.splice(likeIndex, 1);
    } else {
      // Like
      blog.likes.push(userId);
    }

    await blog.save();

    res.json({
      success: true,
      data: {
        liked: likeIndex === -1,
        totalLikes: blog.likes.length
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   POST /api/blog/:id/rate
// @desc    Rate a blog
// @access  Private
export const rateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Update or create rating
    await Rating.findOneAndUpdate(
      { blogId: id, userId },
      { rating },
      { upsert: true, new: true }
    );

    // Recalculate average rating
    const ratings = await Rating.find({ blogId: id });
    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    blog.averageRating = Math.round(averageRating * 10) / 10;
    blog.totalRatings = totalRatings;
    await blog.save();

    res.json({
      success: true,
      data: {
        averageRating: blog.averageRating,
        totalRatings: blog.totalRatings
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   GET /api/blog/:id/rating
// @desc    Get user's rating for a blog
// @access  Private
export const getUserRating = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(404).json({
        success: false,
        data: { rating: null }
      });
    }

    const rating = await Rating.findOne({ blogId: id, userId });

    res.json({
      success: true,
      data: { rating: rating?.rating || null }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   GET /api/blog/categories/list
// @desc    Get all categories with blog counts
// @access  Public
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   GET /api/blog/tags/list
// @desc    Get all tags
// @access  Public
export const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    res.json({
      success: true,
      data: { tags }
    });
  } catch (error: any) {
    next(error);
  }
};

// ============================================
// ADMIN/CRUD OPERATIONS
// ============================================

// @route   GET /api/blog/all
// @desc    Get all blogs including drafts (for admin)
// @access  Admin
export const getAllBlogsForAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      sort = '-createdAt'
    } = req.query;

    const query: any = {};

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum),
      Blog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalBlogs: total,
          limit: limitNum
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   GET /api/blog/edit/:id
// @desc    Get blog by ID for editing (includes drafts)
// @access  Admin
export const getBlogByIdForEdit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      data: { blog }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   POST /api/blog
// @desc    Create a new blog
// @access  Admin
export const createBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      category,
      tags,
      metaTitle,
      metaDescription,
      keywords,
      status = 'draft',
      isFeatured = false
    } = req.body;

    // Get author info from headers (set by admin service or auth middleware)
    const authorId = req.headers['x-user-id'] as string;
    const authorName = req.headers['x-user-name'] as string;
    const authorEmail = req.headers['x-user-email'] as string;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Generate slug from title if not provided
    const blogSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug: blogSlug });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: 'A blog with this slug already exists'
      });
    }

    // Create blog
    const blog = await Blog.create({
      title,
      slug: blogSlug,
      content,
      excerpt: excerpt || content.substring(0, 200),
      featuredImage,
      category,
      tags: tags || [],
      author: {
        id: authorId,
        name: authorName || 'Admin',
        email: authorEmail || 'admin@example.com'
      },
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || content.substring(0, 160),
        keywords: keywords || []
      },
      status,
      isFeatured,
      isPublished: status === 'published',
      publishedAt: status === 'published' ? new Date() : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   PUT /api/blog/:id
// @desc    Update a blog
// @access  Admin
export const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // If slug is being updated, check if it's unique
    if (updateData.slug && updateData.slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug: updateData.slug });
      if (existingBlog) {
        return res.status(400).json({
          success: false,
          message: 'A blog with this slug already exists'
        });
      }
    }

    // Update SEO fields if provided
    if (updateData.metaTitle || updateData.metaDescription || updateData.keywords) {
      updateData.seo = {
        metaTitle: updateData.metaTitle || blog.seo?.metaTitle,
        metaDescription: updateData.metaDescription || blog.seo?.metaDescription,
        keywords: updateData.keywords || blog.seo?.keywords || []
      };
      delete updateData.metaTitle;
      delete updateData.metaDescription;
      delete updateData.keywords;
    }

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog: updatedBlog }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   DELETE /api/blog/:id
// @desc    Delete a blog
// @access  Admin
export const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await Blog.findByIdAndDelete(id);

    // Also delete all ratings for this blog
    await Rating.deleteMany({ blogId: id });

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   POST /api/blog/:id/publish
// @desc    Publish a blog (change status from draft to published)
// @access  Admin
export const publishBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Blog is already published'
      });
    }

    blog.status = 'published';
    blog.isPublished = true;
    blog.publishedAt = new Date();
    await blog.save();

    res.json({
      success: true,
      message: 'Blog published successfully',
      data: { blog }
    });
  } catch (error: any) {
    next(error);
  }
};
