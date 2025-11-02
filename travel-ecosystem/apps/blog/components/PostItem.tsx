/**
 * PostItem Component
 * Purpose: Individual post card for list view
 * Architecture: Reusable post card with image, title, excerpt
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasePath } from '../context/BasePathContext';
import { formatDate, truncate } from '../utils/format';
import Tag from './Tag';
import type { BlogPost } from '../data/dummyPosts';

interface PostItemProps {
  post: BlogPost;
  onClick?: (slug: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onClick }) => {
  const navigate = useNavigate();
  const basePath = useBasePath();

  const handleClick = () => {
    if (onClick) {
      onClick(post.slug);
    } else {
      const slugPath = basePath === '/' ? `/${post.slug}` : `${basePath}/${post.slug}`;
      navigate(slugPath);
    }
  };

  return (
    <article
      className="relative rounded-3xl p-0 overflow-hidden cursor-pointer group animate-fade-in"
      onClick={handleClick}
      style={{ minHeight: 440, background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)', boxShadow: '0 8px 32px rgba(60,60,120,0.12)' }}
    >
      <>
        {/* Glassmorphism card background */}
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg z-0" />
        <div className="relative z-10 p-6 flex flex-col h-full">
          {post.coverImage && (
            <div className="mb-4 overflow-hidden rounded-2xl relative h-56 shadow-lg">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-90"
                loading="lazy"
                style={{ boxShadow: '0 8px 32px rgba(60,60,120,0.16)' }}
              />
              <div className="absolute top-3 left-3 bg-white/80 dark:bg-gray-800/80 px-4 py-1 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow backdrop-blur-md border border-gray-200 dark:border-gray-700">
                {post.categories?.[0]}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <time dateTime={post.publishDate} className="font-medium">
              {formatDate(new Date(post.publishDate))}
            </time>
            <span>•</span>
            <span>{post.tags?.[0]}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight drop-shadow-sm">
            {post.title}
          </h2>
          {post.summary && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 text-base leading-relaxed font-medium">
              {truncate(post.summary ?? '', 120)}
            </p>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 5).map(tag => (
                <Tag
                  key={tag}
                  name={tag}
                  size="sm"
                  onClick={() => {}}
                />
              ))}
            </div>
          )}
          {post.categories && post.categories.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <span>{post.categories.join(', ')}</span>
            </div>
          )}
          {/* Micro-interaction: animated arrow on hover */}
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