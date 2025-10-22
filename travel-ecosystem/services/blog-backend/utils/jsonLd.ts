/**
 * JSON-LD Structured Data Generator
 * Purpose: Generate Schema.org structured data for SEO
 * Architecture: As specified in claude.md - JSON-LD for rich search results
 *
 * Provides:
 * - Article structured data
 * - BreadcrumbList structured data
 * - Organization structured data
 * - BlogPosting schema
 */

interface Post {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage?: string;
  publishDate: Date;
  updatedAt?: Date;
  tags?: string[];
  categories?: string[];
  author?: string;
}

/**
 * Generate JSON-LD for BlogPosting
 * Schema.org Article/BlogPosting type
 */
export const generateBlogPostingJsonLd = (post: Post, baseUrl: string): object => {
  const url = `${baseUrl}/blog/${post.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary || post.content.substring(0, 200),
    image: post.coverImage || `${baseUrl}/images/default-post.jpg`,
    url,
    datePublished: post.publishDate.toISOString(),
    dateModified: post.updatedAt?.toISOString() || post.publishDate.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author || 'RAIH Admin',
    },
    publisher: {
      '@type': 'Organization',
      name: 'RAIH',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: [...(post.tags || []), ...(post.categories || [])].join(', '),
  };
};

/**
 * Generate JSON-LD for BreadcrumbList
 * Provides navigation breadcrumbs for search engines
 */
export const generateBreadcrumbJsonLd = (
  items: Array<{ name: string; url: string }>,
  baseUrl: string
): object => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
};

/**
 * Generate JSON-LD for Organization
 * Site-wide organization schema
 */
export const generateOrganizationJsonLd = (baseUrl: string): object => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RAIH',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Travel blog and community platform for nomadic travelers',
    sameAs: [
      // TODO: Add social media links
      // 'https://twitter.com/nomadicnook',
      // 'https://facebook.com/nomadicnook',
      // 'https://instagram.com/nomadicnook',
    ],
  };
};

/**
 * Generate JSON-LD for Blog
 * Site-wide blog schema
 */
export const generateBlogJsonLd = (baseUrl: string): object => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'RAIH Travel Blog',
    description: 'Stories, tips, and guides from nomadic travelers around the world',
    url: `${baseUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'RAIH',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  };
};

/**
 * Generate JSON-LD for ItemList (blog post listing)
 * Used for category/tag pages
 */
export const generateItemListJsonLd = (
  posts: Post[],
  baseUrl: string,
  listName: string
): object => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${baseUrl}/blog/${post.slug}`,
      name: post.title,
    })),
  };
};

/**
 * Combine multiple JSON-LD objects
 * Returns array of structured data for multiple schema types
 */
export const combineJsonLd = (...jsonLdObjects: object[]): string => {
  return JSON.stringify(jsonLdObjects);
};
