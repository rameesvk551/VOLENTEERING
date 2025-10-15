/**
 * SEO Utilities (Frontend)
 * Purpose: Client-side SEO helpers and metadata management
 * Architecture: As specified in claude.md - SEO utilities for meta tags and structured data
 *
 * Provides:
 * - Dynamic meta tag updates
 * - JSON-LD injection
 * - Social sharing helpers
 */

interface Post {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage?: string;
  publishDate: string;
  tags?: string[];
  categories?: string[];
}

interface MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

/**
 * Update document meta tags
 * Updates <meta> tags in document head
 */
export const updateMetaTags = (tags: MetaTags): void => {
  // Update title
  if (tags.title) {
    document.title = tags.title;
  }

  // Update or create meta tags
  const metaConfig = [
    { name: 'description', content: tags.description },
    { name: 'keywords', content: tags.keywords },
    { property: 'og:title', content: tags.ogTitle || tags.title },
    { property: 'og:description', content: tags.ogDescription || tags.description },
    { property: 'og:image', content: tags.ogImage },
    { property: 'og:url', content: tags.ogUrl },
    { name: 'twitter:card', content: tags.twitterCard || 'summary_large_image' },
    { name: 'twitter:title', content: tags.twitterTitle || tags.title },
    { name: 'twitter:description', content: tags.twitterDescription || tags.description },
    { name: 'twitter:image', content: tags.twitterImage || tags.ogImage },
  ];

  metaConfig.forEach(({ name, property, content }) => {
    if (!content) return;

    const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
    let element = document.querySelector(selector);

    if (!element) {
      element = document.createElement('meta');
      if (name) element.setAttribute('name', name);
      if (property) element.setAttribute('property', property);
      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
  });

  // Update canonical link
  if (tags.canonical) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', tags.canonical);
  }
};

/**
 * Inject JSON-LD structured data
 * Adds or updates JSON-LD script in document head
 */
export const injectJsonLd = (data: object, id: string = 'json-ld'): void => {
  // Remove existing JSON-LD if present
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  // Create new JSON-LD script
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Generate meta tags from post data
 */
export const generatePostMetaTags = (post: Post, baseUrl: string): MetaTags => {
  const url = `${baseUrl}/blog/${post.slug}`;
  const description = post.summary || post.content.substring(0, 160);

  return {
    title: `${post.title} | RAIH Blog`,
    description,
    keywords: [...(post.tags || []), ...(post.categories || [])].join(', '),
    canonical: url,
    ogTitle: post.title,
    ogDescription: description,
    ogImage: post.coverImage || `${baseUrl}/images/default-og.jpg`,
    ogUrl: url,
    twitterCard: 'summary_large_image',
    twitterTitle: post.title,
    twitterDescription: description,
    twitterImage: post.coverImage || `${baseUrl}/images/default-twitter.jpg`,
  };
};

/**
 * Share post on social media
 * Opens share dialog or redirects to social platform
 */
export const sharePost = (platform: 'twitter' | 'facebook' | 'linkedin', post: Post, url: string): void => {
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  window.open(shareUrls[platform], '_blank', 'width=600,height=400');
};

/**
 * Copy link to clipboard
 */
export const copyLinkToClipboard = async (url: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy link:', error);
    return false;
  }
};
