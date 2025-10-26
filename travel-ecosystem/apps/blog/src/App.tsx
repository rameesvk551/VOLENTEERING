/**
 * Root App Component
 * Purpose: Main application wrapper with routing
 * Architecture: React Router for client-side routing
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/index';
import PostPage from '../pages/[slug]';
import SEOHead from '../SEOHead';

const App: React.FC = () => {
  return (
    <Router>
      <SEOHead />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog/:slug" element={<PostPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;
