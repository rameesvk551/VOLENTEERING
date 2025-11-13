import React from 'react';

interface BlogCardProps {
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  source?: string;
  publishedAt?: string;
}
const BlogCardComponent: React.FC<BlogCardProps> = ({
  title,
  description,
  imageUrl,
  href,
  source,
  publishedAt
}) => {
  return (
    <article className="flex w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-900">
      <div className="relative flex-shrink-0" style={{ width: '148px', height: '108px' }}>
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 160px, 200px"
          onError={(event) => {
            (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800&auto=format&fit=crop&q=60';
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-gray-400">
          {source && <span>{source}</span>}
          {publishedAt && (
            <time dateTime={publishedAt}>{new Date(publishedAt).toLocaleDateString()}</time>
          )}
        </div>
        <h3
          className="text-base font-semibold text-gray-900 dark:text-gray-100"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed text-gray-600 dark:text-gray-400"
          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {description}
        </p>
        <div className="mt-auto">
          <a
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300"
          >
            Read more
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  );
};

export const BlogCard = React.memo(BlogCardComponent);
BlogCard.displayName = 'BlogCard';
