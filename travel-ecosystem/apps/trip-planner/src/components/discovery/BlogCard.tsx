import React from 'react';

interface BlogCardProps {
  title: string;
  description: string;
  imageUrl: string;
  href: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({ title, description, imageUrl, href }) => {
  return (
    <article className="flex w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg">
      <div className="relative flex-shrink-0" style={{ width: '144px', height: '96px' }}>
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(event) => {
            (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800';
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <h3 className="text-base font-semibold text-gray-900">
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed text-gray-600"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {description}
        </p>
        <div className="mt-auto">
          <a
            href={href}
            className="text-sm font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-800"
          >
            Read more
          </a>
        </div>
      </div>
    </article>
  );
};
