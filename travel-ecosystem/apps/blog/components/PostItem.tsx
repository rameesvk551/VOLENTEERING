/**
 * PostItem Component
 * Purpose: Individual post card for list view
 * Architecture: Reusable post card with image, title, excerpt
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, truncate } from '../utils/format';
import Tag from './Tag';
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
      className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-0 cursor-pointer group animate-fade-in"
      onClick={handleClick}
      style={{ minHeight: 440, background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)', boxShadow: '0 8px 32px rgba(60,60,120,0.12)' }}
    >
      <>
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg z-0" />
        <div className="relative z-10 p-6 flex flex-col h-full">
          {coverImage ? (
            <div className="mb-4 overflow-hidden rounded-2xl relative h-56 shadow-lg">
              <img
                src={coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-90"
                loading="lazy"
                style={{ boxShadow: '0 8px 32px rgba(60,60,120,0.16)' }}
              />
              <div className="absolute top-3 left-3 bg-white/80 dark:bg-gray-800/80 px-4 py-1 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow backdrop-blur-md border border-gray-200 dark:border-gray-700">
                {post.category}
              </div>
            </div>
          ) : (
            <div className="mb-4 overflow-hidden rounded-2xl relative h-56 shadow-lg flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 text-primary-600 dark:text-primary-300 font-semibold">
              {post.category}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            {publishedOn && (
              <time dateTime={publishedOn} className="font-medium">
                {formatDate(new Date(publishedOn))}
              </time>
            )}
            {publishedOn && post.tags?.length ? <span>•</span> : null}
            {post.tags?.length ? <span>{post.tags[0]}</span> : null}
          </div>

          <h2 className="mb-3 text-2xl font-extrabold leading-tight text-gray-900 transition-colors drop-shadow-sm break-words md:text-3xl dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="mb-4 text-base font-medium leading-relaxed text-gray-700 break-words line-clamp-3 dark:text-gray-300">
              {truncate(post.excerpt, 180)}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mb-4 flex max-w-full flex-wrap gap-2">
              {post.tags.slice(0, 5).map(tag => (
                <Tag
                  key={tag}
                  name={tag}
                  size="sm"
                  onClick={(tagName) => onTagClick?.(tagName)}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <span>{post.category}</span>
            {typeof post.views === 'number' && (
              <span className="ml-auto flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{post.views}</span>
              </span>
            )}
          </div>

          <div className="mt-auto pt-4 flex justify-end">
            <span className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold group-hover:translate-x-1 transition-transform duration-200">
              Read More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </>
    </article>
  );
};

export default PostItem;