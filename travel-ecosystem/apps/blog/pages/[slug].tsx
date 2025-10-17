/**
 * Post Detail Page
 * Purpose: Individual blog post view with full content
 * Architecture: Page component using usePost hook
 */

import React from 'react';
import { dummyPosts } from '../data/dummyPosts';
import { formatDate, formatReadingTime } from '../utils/format';
import { sharePost } from '../utils/seo';
import Tag from '../components/Tag';
import Breadcrumbs from '../components/Breadcrumbs';
import Navbar from '../components/Navbar';

import { useParams } from 'react-router-dom';

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = dummyPosts.find(p => p.slug === slug);
  const loading = false;
  const error = !post ? 'Post not found' : null;

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
          <a href="/" className="btn btn-primary">Back to Home</a>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
    { label: post.title },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </header>

      {post.coverImage && (
        <div className="w-full h-96 overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <time dateTime={post.publishDate}>{formatDate(new Date(post.publishDate))}</time>
          <span>•</span>
          {/* Optionally add reading time and views if available in dummy data */}
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          {post.content}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => <Tag key={tag} name={tag} variant="primary" />)}
            </div>
          </div>
        )}

        {/* No admin actions: only display post and sharing UI */}

        <div className="text-center">
          <a href="/" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            ← Back to all posts
          </a>
        </div>
      </article>
    </div>
  );
};

export default PostPage;