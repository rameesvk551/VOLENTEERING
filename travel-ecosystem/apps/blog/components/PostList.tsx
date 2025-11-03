/**
 * PostList Component
 * Purpose: Display paginated list of blog posts
 * Architecture: Container component with PostItem children
 */

import React, { useMemo, useState } from 'react';
import PostItem from './PostItem';
import CategoryFilter from './CategoryFilter';
import Tag from './Tag';
import { usePosts } from '../hooks/usePosts';
import { useCategories } from '../hooks/useCategories';
import { useTags } from '../hooks/useTags';

interface PostListProps {
  initialPage?: number;
  initialCategory?: string;
  initialTag?: string;
  limit?: number;
}

const PostList: React.FC<PostListProps> = ({
  initialPage = 1,
  initialCategory,
  initialTag,
  limit = 10,
}) => {
  const [page, setPage] = useState(initialPage);
  const [category, setCategory] = useState(initialCategory);
  const [tag, setTag] = useState(initialTag);
  const [sort, setSort] = useState<'date' | 'title' | 'popular'>('date');
  const [searchTerm, setSearchTerm] = useState('');

  const queryParams = useMemo(() => ({
    page,
    limit,
    category: category || undefined,
    tag: tag || undefined,
    search: searchTerm || undefined,
    sort,
  }), [page, limit, category, tag, searchTerm, sort]);

  const { posts, loading, error, pagination } = usePosts(queryParams);
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { tags, loading: tagsLoading } = useTags();

  const handleSelectCategory = (nextCategory?: string) => {
    setCategory(nextCategory);
    setPage(1);
  };

  const handleSelectTag = (nextTag?: string) => {
    setTag(nextTag);
    setPage(1);
  };

  const handleSortChange = (value: 'date' | 'title' | 'popular') => {
    setSort(value);
    setPage(1);
  };

  const renderSkeletons = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card p-6 animate-pulse">
          <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-lg mb-4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4" />
        </div>
      ))}
    </div>
  );

  const renderTags = () => {
    if (tagsLoading) {
      return <span className="text-xs text-gray-500 dark:text-gray-400">Loading tags…</span>;
    }

    if (!tags.length) {
      return null;
    }

    return (
      <div className="flex max-w-full flex-wrap items-center gap-2">
        <button
          type="button"
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
            tag
              ? 'border-gray-200 text-gray-700 hover:bg-blue-50 dark:border-gray-700 dark:text-gray-200'
              : 'bg-primary-600 text-white border-primary-600 shadow'
          }`}
          onClick={() => handleSelectTag(undefined)}
        >
          All
        </button>
        {tags.map(({ name }) => (
          <Tag
            key={name}
            name={name}
            variant={tag === name ? 'primary' : 'default'}
            onClick={() => handleSelectTag(tag === name ? undefined : name)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="sticky top-20 z-30 flex flex-col gap-4 border-b border-gray-100 bg-white py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <CategoryFilter
            categories={categories}
            loading={categoriesLoading}
            error={categoriesError}
            selectedCategory={category}
            onSelectCategory={handleSelectCategory}
          />

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <input
              type="search"
              placeholder="Search posts"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              className="input text-sm sm:w-64"
            />

            <select
              value={sort}
              onChange={(event) => handleSortChange(event.target.value as 'date' | 'title' | 'popular')}
              className="input text-sm"
            >
              <option value="date">Latest First</option>
              <option value="title">Alphabetical</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {renderTags()}
      </div>

      {error && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load posts</h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      )}

      {loading && renderSkeletons()}

      {!loading && !error && posts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {posts.map(post => (
            <PostItem
              key={post._id}
              post={post}
              onTagClick={(tagName) => handleSelectTag(tagName === tag ? undefined : tagName)}
            />
          ))}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No posts found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters.</p>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            disabled={!pagination.hasPrev || loading}
            className="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700 dark:text-gray-300">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((current) => current + 1)}
            disabled={!pagination.hasNext || loading}
            className="btn btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList;