/**
 * PostList Component
 * Purpose: Display paginated list of blog posts
 * Architecture: Container component with PostItem children
 */

import React, { useState } from 'react';
import PostItem from './PostItem';
import CategoryFilter from './CategoryFilter';
import { dummyPosts } from '../data/dummyPosts';

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

  // For demo: use dummy data instead of API
  const posts = dummyPosts;
  const loading = false;
  const error = null;
  const pagination = null;

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load posts</h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="sticky top-16 z-10 bg-white dark:bg-gray-900 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="input text-sm">
          <option value="date">Latest First</option>
          <option value="title">Alphabetical</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-lg mb-4" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4" />
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => <PostItem key={post.id} post={post} />)}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No posts found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters.</p>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button onClick={() => setPage(page - 1)} disabled={!pagination.hasPrev} className="btn btn-secondary disabled:opacity-50">
            Previous
          </button>
          <span className="text-gray-700 dark:text-gray-300">
            Page {page} of {pagination.totalPages}
          </span>
          <button onClick={() => setPage(page + 1)} disabled={!pagination.hasNext} className="btn btn-secondary disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList;