/**
 * Post Detail Page
 * Purpose: Individual blog post view - Minimal 2025 design
 * Architecture: Clean, focused reading experience
 */

import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBasePath } from '../context/BasePathContext';
import { formatDate } from '../utils/format';
import Breadcrumbs from '../components/Breadcrumbs';
import { usePost } from '../hooks/usePosts';
import SEOHead from '../SEOHead';

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const basePath = useBasePath();
  
  const { post, loading, error, jsonLd } = usePost(slug ?? '');

  const plainTextContent = useMemo(() => {
    if (!post?.content) return '';
    return post.content.replace(/<[^>]*>/g, ' ');
  }, [post?.content]);

  const wordCount = useMemo(() => {
    if (!plainTextContent.trim()) return null;
    return plainTextContent.trim().split(/\s+/).filter(Boolean).length;
  }, [plainTextContent]);

  const readingTime = useMemo(() => {
    if (!wordCount) return null;
    return Math.max(1, Math.round(wordCount / 200));
  }, [wordCount]);

  const shareUrl = useMemo(() => {
    if (post?.canonicalUrl) {
      return post.canonicalUrl;
    }
    if (typeof window === 'undefined') return '';
    const basePart = basePath === '/' ? '' : basePath;
    const slugPart = post?.slug?.startsWith('/') ? post.slug : `/${post?.slug || ''}`;
    return `${window.location.origin}${basePart}${slugPart}`;
  }, [basePath, post?.slug, post?.canonicalUrl]);

  const breadcrumbItems = useMemo(() => {
    const blogHomeHref = basePath === '/' ? '/' : basePath || '/blog';
    return [
      { label: 'Home', href: '/' },
      { label: 'Blog', href: blogHomeHref },
      { label: post?.title ?? '' },
    ];
  }, [basePath, post?.title]);

  const breadcrumbJsonLd = useMemo(() => {
    if (!post || !shareUrl) return null;

    let blogListUrl = shareUrl;
    try {
      const url = new URL(shareUrl);
      const segments = url.pathname.split('/').filter(Boolean);
      const blogIndex = segments.indexOf('blog');
      const blogPath = blogIndex >= 0 ? segments.slice(0, blogIndex + 1) : segments;
      url.pathname = `/${blogPath.join('/')}`;
      url.search = '';
      url.hash = '';
      blogListUrl = url.toString();
    } catch (err) {
      console.warn('[PostPage] Unable to normalise blog list URL for breadcrumbs', err);
    }

    const homeUrl = blogListUrl.replace(/\/?blog\/?$/, '/');

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: homeUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: blogListUrl,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: shareUrl,
        },
      ],
    };
  }, [post, shareUrl]);

  const structuredData = useMemo(() => {
    const payloads: object[] = [];
    if (jsonLd) payloads.push(jsonLd as object);
    if (breadcrumbJsonLd) payloads.push(breadcrumbJsonLd);
    return payloads;
  }, [jsonLd, breadcrumbJsonLd]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Post Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The post does not exist.'}</p>
          <Link to={basePath === '/' ? '/' : basePath} className="btn btn-primary">Back to Posts</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead post={post as any} jsonLd={structuredData} />
      <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto pt-4 pb-3">
          <Breadcrumbs items={breadcrumbItems} />

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {post.category}
            </span>
            {post.publishedAt && (
              <>
                <span>·</span>
                <time dateTime={post.publishedAt}>
                  {formatDate(new Date(post.publishedAt))}
                </time>
              </>
            )}
            {readingTime && <><span>·</span><span>{readingTime} min read</span></>}
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight leading-tight">
            {post.title}
          </h1>
        </div>
      </header>

      {post.featuredImage && (
        <div className="max-w-3xl mx-auto py-4">
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            className="w-full h-auto max-h-80 object-cover rounded"
            loading="lazy"
          />
        </div>
      )}

      <main className="max-w-3xl mx-auto pb-12">
        <article className="prose prose-gray prose-sm dark:prose-invert max-w-none">
          {post.content ? (
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }} 
              className="text-gray-700 dark:text-gray-300 leading-relaxed"
            />
          ) : (
            <p className="text-gray-500">No content available.</p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-1.5 not-prose">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Back */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 not-prose">
            <Link
              to={basePath === '/' ? '/' : basePath}
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to posts
            </Link>
          </div>
        </article>

      </main>
    </div>
    </>
  );
};

export default PostPage;