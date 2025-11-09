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
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Travel Stories from Around the World
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join nomadic travelers sharing their adventures, tips, and experiences
          </p>
        </div>
      </section>

      {/* Main Content */}
  <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <PostList limit={12} />
      </main>

      {/* Footer */}
   
      </div>
    </>
  );
};

export default HomePage;