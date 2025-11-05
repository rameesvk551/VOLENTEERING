import type { Response } from 'express';
import type { IBlog } from '../models/Blog.js';

const DEFAULT_BASE_URL = 'https://travel-ecosystem.example.com';

const stripTrailingSlash = (value: string) => value.replace(/\/+$/u, '');

export const getBaseUrl = (): string => {
  const envValue = process.env.SEO_BASE_URL || process.env.PUBLIC_WEB_BASE_URL;
  if (!envValue) {
    return DEFAULT_BASE_URL;
  }
  return stripTrailingSlash(envValue);
};

export const ensureAbsoluteUrl = (relativeOrAbsolute?: string | null): string | undefined => {
  if (!relativeOrAbsolute) {
    return undefined;
  }
  if (/^https?:\/\//iu.test(relativeOrAbsolute)) {
    return relativeOrAbsolute;
  }
  const base = getBaseUrl();
  return `${base}/${relativeOrAbsolute.replace(/^\/+/, '')}`;
};

export const buildCanonicalUrl = (slug: string, override?: string | null): string => {
  if (override && override.trim().length > 0) {
    return override.trim();
  }
  const base = getBaseUrl();
  const normalizedSlug = slug.startsWith('/') ? slug.slice(1) : slug;
  return `${base}/blog/${normalizedSlug}`;
};

export const deriveFeaturedImageAlt = (blog: Pick<IBlog, 'title' | 'seo' | 'category'> & { featuredImageAlt?: string }): string => {
  if (blog.featuredImageAlt && blog.featuredImageAlt.trim().length > 0) {
    return blog.featuredImageAlt.trim();
  }
  if (blog.seo?.metaTitle) {
    return blog.seo.metaTitle;
  }
  return `${blog.title} – ${blog.category}`;
};

export const mapBlogForResponse = (blogDocument: IBlog | (IBlog & { _id?: any })) => {
  const plain = typeof (blogDocument as IBlog).toObject === 'function'
    ? (blogDocument as IBlog).toObject({ getters: true, virtuals: true })
    : blogDocument;

  const canonicalUrl = buildCanonicalUrl(plain.slug, plain.canonicalUrl);
  const featuredImage = ensureAbsoluteUrl(plain.featuredImage) || plain.featuredImage;
  const featuredImageAlt = deriveFeaturedImageAlt({
    title: plain.title,
    category: plain.category,
    seo: plain.seo,
    featuredImageAlt: plain.featuredImageAlt,
  });

  return {
    ...plain,
    _id: plain._id?.toString?.() ?? plain._id,
    canonicalUrl,
    featuredImage,
    featuredImageAlt,
  };
};

export const buildBlogJsonLd = (blog: ReturnType<typeof mapBlogForResponse>) => {
  const canonicalUrl = blog.canonicalUrl;
  const imageUrl = ensureAbsoluteUrl(blog.featuredImage) || blog.featuredImage;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    headline: blog.title,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: blog.publishedAt ?? blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      '@type': 'Person',
      name: blog.author?.name || 'Unknown',
      email: blog.author?.email,
      identifier: blog.author?.id,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Travel Ecosystem',
      logo: {
        '@type': 'ImageObject',
        url: ensureAbsoluteUrl('images/logo.png') || ensureAbsoluteUrl(imageUrl || ''),
      },
    },
    description: blog.seo?.metaDescription || blog.excerpt,
    keywords: blog.seo?.keywords?.join(', ') || blog.tags?.join(', '),
    articleSection: blog.category,
    url: canonicalUrl,
  };
};

export const setResponseCacheHeaders = (res: Response, maxAgeSeconds = 300, staleWhileRevalidateSeconds = 86400) => {
  const directives = [
    `public`,
    `max-age=${Math.max(0, maxAgeSeconds)}`,
    `stale-while-revalidate=${Math.max(0, staleWhileRevalidateSeconds)}`,
  ];

  res.setHeader('Cache-Control', directives.join(', '));
};
