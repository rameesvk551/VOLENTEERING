/**
 * Home Page
 * Purpose: Main blog listing page with posts grid
 * Architecture: Page component using PostList
 */

import React, { useMemo } from 'react';
import PostList from '../components/PostList';
import SEOHead from '../SEOHead';

const HomePage: React.FC = () => {
  const baseUrl = (import.meta.env.VITE_SEO_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const canonical = `${baseUrl}/blog`;
  const landingJsonLd = useMemo(() => ([
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Travel Stories from Around the World',
      description: 'Join nomadic travelers sharing their adventures, tips, and experiences',
      url: canonical,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'RAIH Blog',
      url: canonical,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${canonical}?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ]), [canonical]);

  return (
    <>
      <SEOHead
        title="Travel Stories from Around the World | RAIH Blog"
        description="Join nomadic travelers sharing their adventures, tips, and experiences. Discover destinations, guides, and inspiration for your next journey."
        canonical={canonical}
        ogImage={`${baseUrl}/images/default-og.jpg`}
        jsonLd={landingJsonLd}
      />
      <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero - Minimal 2025 */}
      <section className="border-b border-gray-100 dark:border-gray-800 py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2 tracking-wide uppercase">Stories & Guides</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">
            Travel Stories
          </h1>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl">
            Adventures, tips, and experiences from travelers worldwide
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <PostList limit={12} />
      </main>

      {/* Footer */}
   
      </div>
    </>
  );
};

export default HomePage;