# SEO Enhancements Summary

This document captures the backend and frontend changes implemented to satisfy the SEO tasks (canonical URLs, JSON-LD, sitemap/robots, cache headers, and image alt consumption), along with a short description of what changed and why each change matters.

## Backend (Blog Microservice)

### 1. Meta Refresh Policy Enforcement

**What:** Strip `<meta http-equiv="refresh">` tags from blog content at persistence time.

**Why:** Enforces the decision to disallow automatic refresh/redirect behaviour that can harm crawlability and user experience while keeping the policy codified instead of purely documented.
```ts
// travel-ecosystem-backend/micro-services/blog/src/models/Blog.ts
blogSchema.pre('save', async function (next) {
  if (this.isModified('content') && typeof this.content === 'string') {
    // Strip meta refresh tags to avoid implicit redirects
    this.content = this.content.replace(/<meta[^>]*http-equiv=["']?refresh["']?[^>]*>/giu, '');
  }
  next();
});
```

### 2. Canonical Utilities, JSON-LD, Sitemap Builder, Cache Headers

**What:** Central helper functions normalise outgoing blog documents, generate structured data, construct sitemap XML, and standardise cache headers.

**Why:** Consolidating these transformations guarantees every endpoint returns consistent SEO metadata, reduces duplication across controllers, and prepares the responses for headless consumption or pre-rendering pipelines.
```ts
// travel-ecosystem-backend/micro-services/blog/src/utils/seo.ts
export const mapBlogForResponse = (blogDocument: IBlog) => {
  const canonicalUrl = buildCanonicalUrl(plain.slug, plain.canonicalUrl);
  const featuredImage = ensureAbsoluteUrl(plain.featuredImage) || plain.featuredImage;
  const featuredImageAlt = deriveFeaturedImageAlt({ /* ... */ });
  return { ...plain, canonicalUrl, featuredImage, featuredImageAlt };
};

export const buildBlogJsonLd = (blog: ReturnType<typeof mapBlogForResponse>) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  '@id': blog.canonicalUrl,
  mainEntityOfPage: blog.canonicalUrl,
  headline: blog.title,
  image: blog.featuredImage ? [ensureAbsoluteUrl(blog.featuredImage) ?? blog.featuredImage] : undefined,
  datePublished: blog.publishedAt ?? blog.createdAt,
  dateModified: blog.updatedAt,
  author: { '@type': 'Person', name: blog.author?.name },
  publisher: { '@type': 'Organization', name: 'Travel Ecosystem' },
  description: blog.seo?.metaDescription || blog.excerpt,
  keywords: blog.seo?.keywords?.join(', ') || blog.tags?.join(', '),
  articleSection: blog.category,
  url: blog.canonicalUrl,
});

export const buildSitemapXml = (entries: SitemapUrlEntry[]): string => {
  return ['<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries.map(/* ... */).join('\n'),
    '</urlset>'].join('\n');
};
```

### 3. Sitemap & Robots Endpoints with In-Memory Cache

**What:** Public endpoints now emit a cached sitemap and robots.txt referencing canonical blog URLs.

**Why:** Search engines need a discoverable sitemap and robots directives to crawl the blog efficiently. Caching avoids recomputation on every request while still permitting timely updates.
```ts
// travel-ecosystem-backend/micro-services/blog/src/controllers/blog.controller.ts
export const getSitemap = async (req, res) => {
  if (sitemapCache.xml && sitemapCache.expiresAt > Date.now()) {
    setResponseCacheHeaders(res, 3600, 604800);
    return res.type('application/xml').send(sitemapCache.xml);
  }
  const blogs = await Blog.find({ status: 'published', isPublished: true })
    .select('slug canonicalUrl updatedAt publishedAt')
    .lean();
  const xml = buildSitemapXml([
    { loc: `${baseUrl}/blog`, changefreq: 'daily', priority: 0.9, lastmod: new Date() },
    ...blogs.map(blog => ({
      loc: buildCanonicalUrl(blog.slug, blog.canonicalUrl),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: blog.updatedAt || blog.publishedAt || new Date(),
    })),
  ]);
  sitemapCache.xml = xml;
  sitemapCache.expiresAt = Date.now() + 3600_000;
  setResponseCacheHeaders(res, 3600, 604800);
  return res.type('application/xml').send(xml);
};

export const getRobotsTxt = async (req, res) => {
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /dashboard/',
    `Sitemap: ${blogSitemapUrl}`,
    `Sitemap: ${apiSitemapUrl}`,
    '',
  ];
  setResponseCacheHeaders(res, 86400, 604800);
  return res.type('text/plain').send(lines.join('\n'));
};
```

### 4. Route Exposure

**What:** Added Express routes for `/sitemap.xml` and `/robots.txt` on the blog service.

**Why:** Without explicit routes the new controllers cannot be reached; this ties the functionality into the HTTP surface area consumed by the gateway.
```ts
// travel-ecosystem-backend/micro-services/blog/src/routes/blog.routes.ts
router.get('/sitemap.xml', getSitemap);
router.get('/robots.txt', getRobotsTxt);
```

## Frontend (Blog Microfrontend)

### 1. API Surface & Hooks Surface Canonical + JSON-LD

**What:** Blog API client and hooks now return canonical URLs, image alt text, and JSON-LD payloads alongside the blog document.

**Why:** Exposing metadata to React components enables client-side SEO instrumentation (canonical links, OG tags, structured data) without additional fetches.
```ts
// travel-ecosystem/apps/blog/services/api.ts
export async function getPostBySlug(slug: string): Promise<{ blog: Post; jsonLd?: unknown }> {
  const response = await fetchAPI(`
    /blog/${slug}
  `);
  return {
    blog: response.data.blog,
    jsonLd: response.data.jsonLd,
  };
}
```

```ts
// travel-ecosystem/apps/blog/hooks/usePosts.ts
const [jsonLd, setJsonLd] = useState<unknown | null>(null);
const response = await getPostBySlug(slug);
setPost(response.blog);
setJsonLd(response.jsonLd ?? null);
return { post, loading, error, jsonLd };
```

### 2. SEOHead Enhancements & JSON-LD Management

**What:** `SEOHead` updates meta tags, injects multiple JSON-LD blocks, and cleans up scripts on unmount.

**Why:** Ensures canonical, Open Graph, and Twitter metadata stay in sync with the current route and prevents stale structured data from lingering when navigating client-side.
```tsx
// travel-ecosystem/apps/blog/SEOHead.tsx
const normalizedJsonLd = useMemo(() =>
  (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean),
[jsonLd]);

useEffect(() => {
  const baseUrl = import.meta.env.VITE_SEO_BASE_URL || 'http://localhost:3000';
  updateMetaTags(post ? generatePostMetaTags(post, baseUrl) : { /* default meta */ });

  document
    .querySelectorAll('script[data-seo-head-json-ld="true"]')
    .forEach(node => node.remove());

  normalizedJsonLd.forEach((payload, index) => {
    injectJsonLd(payload, `seo-json-ld-${index}`);
  });

  return () => {
    document
      .querySelectorAll('script[data-seo-head-json-ld="true"]')
      .forEach(node => node.remove());
  };
}, [post, normalizedJsonLd, title, description, canonical, ogImage, keywords]);
```

### 3. Blog Listing Page Meta + Structured Data

**What:** Home page now defines canonical/OG tags and emits CollectionPage + WebSite JSON-LD definitions with search action metadata.

**Why:** Gives crawlers explicit context for the listing page, improving SEO for index pages and enabling enhanced search features (e.g., sitelinks search box).
```tsx
// travel-ecosystem/apps/blog/pages/index.tsx
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

<SEOHead
  title="Travel Stories from Around the World | RAIH Blog"
  description="Join nomadic travelers sharing their adventures, tips, and experiences."
  canonical={canonical}
  ogImage={`${baseUrl}/images/default-og.jpg`}
  jsonLd={landingJsonLd}
/>
```

### 4. Post Detail Page Canonical, JSON-LD, Breadcrumb Schema, Image Alt

**What:** Post detail screen consumes backend metadata, builds breadcrumb structured data, and feeds it to `SEOHead` while respecting image alt text.

**Why:** Provides search engines with canonical references, breadcrumb hints, and richer SERP snippets; also improves accessibility by prioritising editorial alt text.
```tsx
// travel-ecosystem/apps/blog/pages/[slug].tsx
const { post, jsonLd } = usePost(slug ?? '');
const breadcrumbJsonLd = useMemo(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: homeUrl },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: blogListUrl },
    { '@type': 'ListItem', position: 3, name: post.title, item: shareUrl },
  ],
}), [post, shareUrl]);

const structuredData = useMemo(() => {
  const payloads: object[] = [];
  if (jsonLd) payloads.push(jsonLd as object);
  if (breadcrumbJsonLd) payloads.push(breadcrumbJsonLd);
  return payloads;
}, [jsonLd, breadcrumbJsonLd]);

return (
  <>
    <SEOHead post={post} jsonLd={structuredData} />
    {/* ... */}
    {post.featuredImage && (
      <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} />
    )}
  </>
);
```

### 5. Breadcrumb Component Schema.org Markup

**What:** Breadcrumb component renders `BreadcrumbList` microdata with `ListItem` entries and positional metadata.

**Why:** Schema markup allows crawlers to reconstruct navigation hierarchy, a prerequisite for breadcrumb rich results.
```tsx
// travel-ecosystem/apps/blog/components/Breadcrumbs.tsx
<nav aria-label="Breadcrumb" className="text-sm">
  <ol itemScope itemType="https://schema.org/BreadcrumbList">
    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
      <a href={item.href} itemProp="item">
        <span itemProp="name">{item.label}</span>
      </a>
      <meta itemProp="position" content={(index + 1).toString()} />
    </li>
  </ol>
</nav>
```

### 6. Post Cards Respect Image Alt

**What:** Post listing cards display the backend-provided `featuredImageAlt` fallback.

**Why:** Consistent alt text improves accessibility and ensures sharing previews use descriptive alt metadata when available.
```tsx
// travel-ecosystem/apps/blog/components/PostItem.tsx
<img
  src={coverImage}
  alt={post.featuredImageAlt || post.title}
  loading="lazy"
/>
```

## Verification Checklist

- `GET /api/blog/:slug` ⇒ returns `blog`, `jsonLd`, canonical URL, image alt, cache headers.
- `GET /api/blog/sitemap.xml` ⇒ XML with blog URLs and canonical references.
- `GET /api/blog/robots.txt` ⇒ references both public `/blog/sitemap.xml` and API `/api/blog/sitemap.xml`.
- Blog frontend rendering sets canonical/OG/Twitter tags, injects JSON-LD, and uses alt text for hero images.
