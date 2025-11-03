/**
 * Post Detail Page
 * Purpose: Individual blog post view with full content
 * Architecture: Page component using usePost hook
 */

import React, { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useBasePath } from '../context/BasePathContext';
import { formatDate } from '../utils/format';
import Tag from '../components/Tag';
import Breadcrumbs from '../components/Breadcrumbs';
import { usePost, usePosts } from '../hooks/usePosts';

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const basePath = useBasePath();
  const navigate = useNavigate();
  
  // All hooks must be called before any early returns
  const { post, loading, error } = usePost(slug ?? '');
  
  // Fetch related posts - must be called before early returns
  const { posts: relatedPosts, loading: relatedLoading } = usePosts({
    limit: 6,
    category: post?.category,
  });

  // State hooks
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const normalizePath = (value?: string) => {
    if (!value || value === '/') return '';
    return value.endsWith('/') ? value.slice(0, -1) : value;
  };

  // Extract images from blog content for gallery
  const galleryImages = useMemo(() => {
    if (!post?.content) return [] as Array<{ src: string; alt: string }>;

    const images: Array<{ src: string; alt: string }> = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi;
    let match: RegExpExecArray | null;

    while ((match = imgRegex.exec(post.content)) !== null && images.length < 4) {
      if (match[1] && match[1] !== post.featuredImage) {
        images.push({ src: match[1], alt: match[2] || 'Gallery image' });
      }
    }

    return images;
  }, [post?.content, post?.featuredImage]);

  const filteredRelatedPosts = useMemo(
    () => relatedPosts.filter(p => p.slug !== post?.slug).slice(0, 5),
    [relatedPosts, post?.slug]
  );

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
    if (typeof window === 'undefined') return '';
    const normalizedBase = normalizePath(basePath);
    const normalizedSlug = post?.slug?.startsWith('/') ? post.slug : `/${post?.slug || ''}`;
    return `${window.location.origin}${normalizedBase}${normalizedSlug}`;
  }, [basePath, post?.slug]);

  const encodedShareUrl = useMemo(() => encodeURIComponent(shareUrl), [shareUrl]);
  const encodedTitle = useMemo(() => encodeURIComponent(post?.title ?? ''), [post?.title]);

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

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title },
  ];

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 2000);
    } catch (err) {
      console.error('[PostPage] Failed to copy share link', err);
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(40%_60%_at_50%_0%,rgba(79,70,229,0.18),rgba(5,5,15,0))] dark:bg-[radial-gradient(40%_60%_at_50%_0%,rgba(79,70,229,0.35),rgba(5,5,15,0))]" />

      <header className="relative border-b border-white/40 dark:border-gray-800/60">
  <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 pt-16 pb-12">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center rounded-full border border-primary-200/70 bg-primary-50/70 px-3 py-1 text-primary-700 dark:border-primary-400/30 dark:bg-primary-500/10 dark:text-primary-200">
              {post.category}
            </span>
            {post.publishedAt && (
              <>
                <span className="text-gray-400 dark:text-gray-600">•</span>
                <time dateTime={post.publishedAt} className="font-medium text-gray-700 dark:text-gray-300">
                  {formatDate(new Date(post.publishedAt))}
                </time>
              </>
            )}
            {typeof post.views === 'number' && (
              <>
                <span className="text-gray-400 dark:text-gray-600">•</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{post.views.toLocaleString()} views</span>
              </>
            )}
            {readingTime && (
              <>
                <span className="text-gray-400 dark:text-gray-600">•</span>
                <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  {readingTime} min read
                </span>
              </>
            )}
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-gray-900 dark:text-slate-50 sm:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              {post.excerpt}
            </p>
          )}
        </div>
      </header>

      {post.featuredImage && (
  <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 -mt-12 mb-12">
          <figure className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-primary-900/10 dark:border-gray-800/80 dark:bg-gray-900">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="h-96 w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              loading="lazy"
            />
          </figure>
        </div>
      )}

  <main className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 pb-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <article className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-xl shadow-primary-900/5 backdrop-blur-md dark:border-gray-800/70 dark:bg-gray-900/90 md:p-12">
            <div className="prose prose-lg max-w-none text-gray-700 dark:prose-invert dark:text-gray-300 break-words overflow-wrap-anywhere">
              {post.content ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                  className="break-words hyphens-auto"
                  style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                />
              ) : (
                <p>No content available.</p>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-12">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tagged</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Tag key={tag} name={tag} variant="primary" />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Share insight</p>
                <p className="text-base text-gray-700 dark:text-gray-300">Enjoyed the read? Share it with your network.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={shareUrl ? `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-100 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-200"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.633 7.997c.013.176.013.353.013.53 0 5.394-4.107 11.62-11.62 11.62-2.31 0-4.46-.676-6.267-1.843.323.037.633.05.97.05a8.18 8.18 0 005.073-1.743 4.09 4.09 0 01-3.82-2.84c.254.037.508.063.775.063.369 0 .737-.05 1.08-.139a4.083 4.083 0 01-3.272-4.01v-.05c.546.305 1.18.495 1.854.52a4.075 4.075 0 01-1.82-3.397c0-.747.202-1.43.557-2.026a11.6 11.6 0 008.429 4.278 4.604 4.604 0 01-.101-.938 4.087 4.087 0 017.066-2.796 8.043 8.043 0 002.594-.988 4.086 4.086 0 01-1.797 2.253 8.166 8.166 0 002.352-.633 8.785 8.785 0 01-2.045 2.118z" />
                  </svg>
                  Share
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:-translate-y-0.5 hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l3.293-3.293a1 1 0 011.414 0L16 12m-8 0l3.293 3.293a1 1 0 001.414 0L16 12" />
                    <rect x="4" y="4" width="16" height="16" rx="4" />
                  </svg>
                  {copyState === 'copied' ? 'Copied!' : copyState === 'error' ? 'Try again' : 'Copy link'}
                </button>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link
                to={basePath === '/' ? '/' : basePath}
                className="inline-flex items-center gap-2 text-primary-600 transition hover:translate-x-1 dark:text-primary-400"
              >
                ← Back to all posts
              </Link>
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-primary-900/5 backdrop-blur dark:border-gray-800/60 dark:bg-gray-900/80">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">At a glance</h2>
              <dl className="mt-5 grid gap-4 text-sm text-gray-700 dark:text-gray-300">
                {post.publishedAt && (
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-200">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-gray-100">Published</dt>
                      <dd>{formatDate(new Date(post.publishedAt))}</dd>
                    </div>
                  </div>
                )}
                {wordCount && (
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-200">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M5 8l7-7 7 7" />
                      </svg>
                    </span>
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-gray-100">Word count</dt>
                      <dd>{wordCount.toLocaleString()} words</dd>
                    </div>
                  </div>
                )}
                {readingTime && (
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-200">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                    </span>
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-gray-100">Reading time</dt>
                      <dd>~{readingTime} minute{readingTime > 1 ? 's' : ''}</dd>
                    </div>
                  </div>
                )}
                {typeof post.views === 'number' && (
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-200">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    </span>
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-gray-100">Views</dt>
                      <dd>{post.views.toLocaleString()}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            {(post.author?.name || post.author?.email) && (
              <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-primary-900/5 backdrop-blur dark:border-gray-800/60 dark:bg-gray-900/80">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Author</h2>
                <div className="mt-4 flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-lg font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-200">
                    {(post.author?.name || 'A')[0]?.toUpperCase()}
                  </span>
                  <div>
                    {post.author?.name && (
                      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{post.author?.name}</p>
                    )}
                    {post.author?.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{post.author?.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PostPage;