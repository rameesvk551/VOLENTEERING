/**
 * SEOHead Component
 * Purpose: Dynamic meta tags and JSON-LD injection
 * Architecture: Component for managing document head SEO
 */

import { useEffect } from 'react';
import { updateMetaTags, injectJsonLd, generatePostMetaTags } from './utils/seo';
import type { Post } from './services/api';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  post?: Post;
  jsonLd?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  post,
  jsonLd,
}) => {
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_SEO_BASE_URL || 'http://localhost:3000';

    // If post is provided, generate post-specific meta tags
    if (post) {
      const postMetaTags = generatePostMetaTags(post as any, baseUrl);
      updateMetaTags(postMetaTags);
    } else {
      // Use provided meta tags
      updateMetaTags({
        title: title || 'RAIH Blog',
        description: description || 'Travel stories, tips, and guides from nomadic travelers',
        keywords: keywords?.join(', ') || 'travel, blog, nomadic, adventure',
        canonical: canonical || baseUrl,
        ogImage: ogImage || `${baseUrl}/images/default-og.jpg`,
      });
    }

    // Inject JSON-LD if provided
    if (jsonLd) {
      injectJsonLd(jsonLd);
    }
  }, [title, description, keywords, canonical, ogImage, post, jsonLd]);

  return null; // This component doesn't render anything
};

export default SEOHead;