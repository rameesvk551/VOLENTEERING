/**
 * SEO Utilities
 * Purpose: Generate SEO-friendly metadata and structured data
 * Architecture: As specified in claude.md - SEO and JSON-LD generation
 *
 * Provides:
 * - Meta tags generation
 * - OpenGraph metadata
 * - Twitter Card metadata
 * - URL slug generation
 */

interface Post {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage?: string;
  publishDate: Date;
  tags?: string[];
  categories?: string[];
  author?: string;
}

interface SeoMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

/**
 * Generate SEO metadata for a blog post
 * Returns comprehensive meta tags for HTML head
 */
export const generatePostSeoMetadata = (post: Post, baseUrl: string): SeoMetadata => {
  const url = `${baseUrl}/blog/${post.slug}`;
  const description = post.summary || post.content.substring(0, 160);
  const keywords = [...(post.tags || []), ...(post.categories || [])];

  return {
    title: `${post.title} | RAIH Blog`,
    description,
    keywords,
    canonical: url,

    // OpenGraph
    ogTitle: post.title,
    ogDescription: description,
    ogImage: post.coverImage || `${baseUrl}/images/default-og.jpg`,
    ogType: 'article',

    // Twitter Card
    twitterCard: 'summary_large_image',
    twitterTitle: post.title,
    twitterDescription: description,
    twitterImage: post.coverImage || `${baseUrl}/images/default-twitter.jpg`,
  };
};

/**
 * Generate URL-friendly slug from title
 * Converts "My Blog Post!" to "my-blog-post"
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Remove consecutive hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
};

/**
 * Validate slug format
 * Ensures slug meets SEO best practices
 */
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100;
};

/**
 * Extract excerpt from content
 * Returns first N characters with ellipsis
 */
export const extractExcerpt = (content: string, maxLength: number = 200): string => {
  if (content.length <= maxLength) {
    return content;
  }

  const excerpt = content.substring(0, maxLength);
  const lastSpace = excerpt.lastIndexOf(' ');

  return lastSpace > 0
    ? excerpt.substring(0, lastSpace) + '...'
    : excerpt + '...';
};

/**
 * Calculate reading time
 * Estimates minutes to read based on word count
 */
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Generate sitemap XML for all posts
 * TODO: Implement sitemap generation
 */
export const generateSitemap = (posts: Post[], baseUrl: string): string => {
  // TODO: Implement sitemap XML generation
  return '<?xml version="1.0" encoding="UTF-8"?><urlset><!-- sitemap --></urlset>';
};

/**
 * Generate RSS feed for all posts
 * TODO: Implement RSS feed generation
 */
export const generateRssFeed = (posts: Post[], baseUrl: string): string => {
  // TODO: Implement RSS XML generation
  return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><!-- rss feed --></rss>';
};
