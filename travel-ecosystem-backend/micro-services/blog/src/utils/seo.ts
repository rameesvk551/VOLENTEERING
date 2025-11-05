import type { Response } from 'express';
import type { Document } from 'mongoose';
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

type BlogPlain = Omit<IBlog, keyof Document> & { _id?: unknown; __v?: unknown };

export type BlogResponse = BlogPlain & {
  _id?: string;
  canonicalUrl: string;
  featuredImage?: string;
  featuredImageAlt: string;
};

const toPlainBlog = (blogDocument: unknown): BlogPlain => {
  if (typeof (blogDocument as { toObject?: unknown })?.toObject === 'function') {
    return (blogDocument as { toObject: (options?: unknown) => BlogPlain }).toObject({ getters: true, virtuals: true });
  }
  return blogDocument as BlogPlain;
};

export const mapBlogForResponse = (blogDocument: unknown): BlogResponse => {
  const plain = toPlainBlog(blogDocument);

  const canonicalUrl = buildCanonicalUrl(plain.slug, plain.canonicalUrl);
  const featuredImage = ensureAbsoluteUrl(plain.featuredImage) || plain.featuredImage;
  const featuredImageAlt = deriveFeaturedImageAlt({
    title: plain.title,
    category: plain.category,
    seo: plain.seo,
    featuredImageAlt: plain.featuredImageAlt,
  });

  const normalizedId = typeof plain._id === 'object' && plain._id !== null && 'toString' in plain._id
    ? (plain._id as { toString: () => string }).toString()
    : (plain._id as string | undefined);

  return {
    ...plain,
    _id: normalizedId,
    canonicalUrl,
    featuredImage,
    featuredImageAlt,
  } as BlogResponse;
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

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string | Date;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const buildSitemapXml = (entries: SitemapUrlEntry[]): string => {
  const urlset = entries
    .filter((entry) => Boolean(entry.loc))
    .map((entry) => {
      const lastmod = entry.lastmod
        ? new Date(entry.lastmod).toISOString()
        : undefined;

      return [
        '  <url>',
        `    <loc>${entry.loc}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : undefined,
        entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : undefined,
        typeof entry.priority === 'number' ? `    <priority>${entry.priority.toFixed(1)}</priority>` : undefined,
        '  </url>'
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', urlset, '</urlset>']
    .filter(Boolean)
    .join('\n');
};
