/**
 * Post Detail Page
 * Purpose: Individual blog post view with full content
 * Architecture: Page component using usePost hook
 */

import React, { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useBasePath } from '../context/BasePathContext';
import { formatDate } from '../utils/format';
import { usePost, usePosts } from '../hooks/usePosts';

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const basePath = useBasePath();
  const navigate = useNavigate();
  const { post, loading, error } = usePost(slug ?? '');

  // Extract images from blog content for gallery
  const galleryImages = useMemo(() => {
    if (!post?.content) return [] as Array<{ src: string; alt: string }>;

    const images: Array<{ src: string; alt: string }> = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match: RegExpExecArray | null;

    while ((match = imgRegex.exec(post.content)) !== null && images.length < 4) {
      if (match[1] && match[1] !== post.featuredImage) {
        const altMatch = /alt=["']([^"']*)["']/i.exec(match[0]);
        images.push({ 
          src: match[1], 
          alt: altMatch ? altMatch[1] : 'Gallery image' 
        });
      }
    }

    return images;
  }, [post?.content, post?.featuredImage]);

  // Fetch related posts
  const { posts: relatedPosts } = usePosts({
    limit: 6,
    category: post?.category,
  });

  const filteredRelatedPosts = useMemo(
    () => relatedPosts.filter(p => p.slug !== post?.slug).slice(0, 5),
    [relatedPosts, post?.slug]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Post Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The post does not exist.'}</p>
          <Link to={basePath} className="text-primary-600 hover:underline">Back to Posts</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            {/* Image Gallery Grid */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {galleryImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
                    style={{ aspectRatio: '16/10' }}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {img.alt && img.alt !== 'Gallery image' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white text-sm font-medium italic text-center">
                          {img.alt}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Featured Image (if no gallery) */}
            {post.featuredImage && galleryImages.length === 0 && (
              <div className="mb-8 overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '500px' }}
                  loading="lazy"
                />
              </div>
            )}

            {/* Article Content */}
            <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-8">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                {post.publishedAt && (
                  <>
                    <time dateTime={post.publishedAt} className="font-medium">
                      {formatDate(new Date(post.publishedAt))}
                    </time>
                    <span>•</span>
                  </>
                )}
                <span className="font-medium">{post.category}</span>
                {typeof post.views === 'number' && (
                  <>
                    <span>•</span>
                    <span>{post.views.toLocaleString()} views</span>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
                {post.content ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  <p>No content available.</p>
                )}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Link */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to={basePath}
                  className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to all posts
                </Link>
              </div>
            </article>
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Related Posts */}
              {filteredRelatedPosts.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Related Posts
                  </h2>
                  <div className="space-y-4">
                    {filteredRelatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.slug}
                        to={`${basePath}/${relatedPost.slug.replace(/^\/+/, '')}`}
                        className="group block"
                      >
                        <div className="flex gap-3">
                          {relatedPost.featuredImage && (
                            <div className="flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg">
                              <img
                                src={relatedPost.featuredImage}
                                alt={relatedPost.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-1">
                              {relatedPost.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {relatedPost.publishedAt && formatDate(new Date(relatedPost.publishedAt))}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Info */}
              {(post.author?.name || post.author?.email) && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    About the Author
                  </h2>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg">
                      {(post.author?.name || 'A')[0]?.toUpperCase()}
                    </div>
                    <div>
                      {post.author?.name && (
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {post.author.name}
                        </p>
                      )}
                      {post.author?.email && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {post.author.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Share this post
                </h2>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.633 7.997c.013.176.013.353.013.53 0 5.394-4.107 11.62-11.62 11.62-2.31 0-4.46-.676-6.267-1.843.323.037.633.05.97.05a8.18 8.18 0 005.073-1.743 4.09 4.09 0 01-3.82-2.84c.254.037.508.063.775.063.369 0 .737-.05 1.08-.139a4.083 4.083 0 01-3.272-4.01v-.05c.546.305 1.18.495 1.854.52a4.075 4.075 0 01-1.82-3.397c0-.747.202-1.43.557-2.026a11.6 11.6 0 008.429 4.278 4.604 4.604 0 01-.101-.938 4.087 4.087 0 017.066-2.796 8.043 8.043 0 002.594-.988 4.086 4.086 0 01-1.797 2.253 8.166 8.166 0 002.352-.633 8.785 8.785 0 01-2.045 2.118z" />
                    </svg>
                    Twitter
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
