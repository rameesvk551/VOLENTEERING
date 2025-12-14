/**
 * PostItem Component
 * Purpose: Individual post card for list view
 * Architecture: Clean, minimal 2025 design
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, truncate } from '../utils/format';
import type { Post } from '../services/api';

interface PostItemProps {
  post: Post;
  onClick?: (slug: string) => void;
  onTagClick?: (tag: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onClick, onTagClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!post.slug) {
      console.warn('[PostItem] Missing slug for post', post);
      return;
    }

    const normalizedSlug = post.slug.replace(/^\/+/, '');

    if (onClick) {
      onClick(normalizedSlug);
      return;
    }

    navigate(normalizedSlug, { relative: 'path' });
  };

  const coverImage = post.featuredImage;
  const publishedOn = post.publishedAt || post.createdAt;

  return (
    <article
      className="group flex flex-col bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border border-gray-100 dark:border-gray-700/50"
      onClick={handleClick}
    >
      {/* Image */}
      {coverImage ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={coverImage}
            alt={post.featuredImageAlt || post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200 rounded-full backdrop-blur-sm">
            {post.category}
          </span>
        </div>
      ) : (
        <div className="relative aspect-[16/10] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 text-gray-400 dark:text-gray-500">
          <span className="text-sm font-medium">{post.category}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
          {publishedOn && (
            <time dateTime={publishedOn}>{formatDate(new Date(publishedOn))}</time>
          )}
          {typeof post.views === 'number' && (
            <>
              <span>•</span>
              <span>{post.views} views</span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {truncate(post.excerpt, 120)}
          </p>
        )}

        {/* Tags - minimal */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {post.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
                className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default PostItem;