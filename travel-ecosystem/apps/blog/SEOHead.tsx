/**
 * SEOHead Component
 * Purpose: Dynamic meta tags and JSON-LD injection
 * Architecture: Component for managing document head SEO
 */

import { useEffect, useMemo } from 'react';
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
  const normalizedJsonLd = useMemo(() => {
    if (!jsonLd) return [] as object[];
    return (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean) as object[];
  }, [jsonLd]);

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
        ogUrl: canonical || baseUrl,
      });
    }

    // Clear existing SEO-managed JSON-LD nodes before injecting new ones
    const managedScripts = document.querySelectorAll('script[data-seo-head-json-ld="true"]');
    managedScripts.forEach(node => {
      node.parentElement?.removeChild(node);
    });

    normalizedJsonLd.forEach((payload, index) => {
      injectJsonLd(payload, `seo-json-ld-${index}`);
    });

    return () => {
      const cleanupScripts = document.querySelectorAll('script[data-seo-head-json-ld="true"]');
      cleanupScripts.forEach(node => {
        node.parentElement?.removeChild(node);
      });
    };
  }, [title, description, keywords, canonical, ogImage, post, normalizedJsonLd]);

  return null; // This component doesn't render anything
};

export default SEOHead;