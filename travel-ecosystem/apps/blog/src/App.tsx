/**
 * Root App Component
 * Purpose: Main application wrapper with routing
 * Architecture: React Router for client-side routing
 */

import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useInRouterContext } from 'react-router-dom';
import '../styles/index.css';
import HomePage from '../pages/index';
import PostPage from '../pages/[slug]';
import { BasePathProvider } from '../context/BasePathContext';

interface BlogAppProps {
  basePath?: string;
}

const normalizeBasePath = (path?: string): string => {
  if (!path) return '/blog';
  const trimmed = path.trim();
  if (!trimmed || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/|\/$/g, '')}`;
};

interface BlogRoutesProps {
  basePath: string;
  nested: boolean;
}

const BlogRoutes: React.FC<BlogRoutesProps> = ({ basePath, nested }) => (
  <BasePathProvider value={basePath}>
    <Routes>
      {nested ? (
        <>
          <Route index element={<HomePage />} />
          <Route path=":slug" element={<PostPage />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<HomePage />} />
          <Route path="/:slug" element={<PostPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  </BasePathProvider>
);

const App: React.FC<BlogAppProps> = ({ basePath = '/blog' }) => {
  const normalizedBase = useMemo(() => normalizeBasePath(basePath), [basePath]);
  const inRouter = useInRouterContext();

  if (inRouter) {
    return <BlogRoutes basePath={normalizedBase} nested />;
  }

  const browserRouterProps = normalizedBase === '/' ? {} : { basename: normalizedBase };

  return (
    <BrowserRouter {...browserRouterProps}>
      <BlogRoutes basePath={normalizedBase} nested={false} />
    </BrowserRouter>
  );
};

export default App;
