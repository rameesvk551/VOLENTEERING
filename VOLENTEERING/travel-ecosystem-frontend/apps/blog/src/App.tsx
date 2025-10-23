/**
 * Root App Component
 * Purpose: Main application wrapper with routing
 * Architecture: React Router for client-side routing
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import HomePage from '../pages/index';
import PostPage from '../pages/[slug]';
import SEOHead from '../SEOHead';

// Wrapper component to extract slug from URL params
const PostPageWrapper: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <PostPage slug={slug || ''} />;
};

const App: React.FC = () => {
  return (
    <Router>
      <SEOHead />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog/:slug" element={<PostPageWrapper />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;
