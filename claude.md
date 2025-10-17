# Claude Code Best Practices for RAIH Travel Blog

## Overview

This document outlines the architecture, folder structure, and best practices for a standalone travel blog system, designed as microservices and micro-frontends for modular integration into the RAIH app.


## Backend: Blog Microservice

## Progressive Web App (PWA) Enablement

To make your blog micro-frontend a Progressive Web App (PWA), follow these steps:

- **Manifest File:** Add a `public/manifest.json` with app name, icons, theme color, and display mode.
- **Service Worker:** Use Workbox or custom service worker to cache assets and API responses for offline access. Register the service worker in your main entry file.
- **Installability:** Ensure the manifest and service worker are correctly configured so browsers prompt users to "install" the app.
- **HTTPS Required:** PWAs require serving over HTTPS for service worker functionality.
- **Add to Home Screen:** Use meta tags and manifest properties to enable "Add to Home Screen" on mobile devices.
- **Update Handling:** Notify users when a new version is available and prompt for refresh.
- **Testing:** Use Chrome DevTools Lighthouse to audit PWA compliance and performance.

### Example manifest.json
```json
{
  "name": "RAIH Blog",
  "short_name": "NookBlog",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Example Service Worker Registration (React)
```ts
// src/main.tsx or src/index.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
```

### Resources
- [Google Web Fundamentals: PWA](https://developers.google.com/web/progressive-web-apps)
- [Workbox Service Worker](https://developer.chrome.com/docs/workbox/)

**Tech Stack:** Node.js + TypeScript + Express (or NestJS), MongoDB


## Advanced Design & Functionality Recommendations

### Design

- **Dark Mode & Theme Customization:** Support dark/light themes and allow users to choose or follow system preferences. Use Tailwind's dark mode utilities and provide a toggle in the UI.
- **Micro-Animations:** Use Framer Motion or CSS transitions for smooth page transitions, button presses, and loading states. Animate list items, modals, and feedback messages for delight.
- **Custom Illustrations & Icons:** Use SVGs or icon libraries (e.g., Heroicons) for a unique, modern look. Consider custom illustrations for empty/error states and onboarding.
- **Sticky Navigation & Breadcrumbs:** Keep navigation accessible at all times. Use sticky headers and breadcrumbs for orientation.
- **Card-Based Layouts:** Present posts, categories, and actions in visually distinct cards with hover/focus effects.
- **Typography Scale:** Use a clear type scale for headings, body, captions, and code. Consider variable fonts for performance and style.
- **Content Preview & Excerpts:** Show post previews with summary, cover image, and tags. Use skeleton loaders for async content.
- **Accessibility:** Use semantic HTML, ARIA roles, and test with screen readers. Ensure all interactive elements are keyboard accessible.

### Functionality

- **Full-Text Search:** Implement client-side or server-side search for posts, categories, and tags. Use instant search with debounce and highlight matches.
- **Filter & Sort:** Allow users to filter posts by category, tag, date, and sort by popularity or recency.
- **Infinite Scroll or Pagination:** Use infinite scroll for seamless browsing or paginated lists for control. Show loading indicators and maintain scroll position.
- **RSS & Sitemap:** Auto-generate RSS feeds and sitemaps for SEO and content distribution.
- **Share & Bookmark:** Add social sharing buttons and allow users to bookmark or save posts.
- **Offline Reading:** Cache recent posts and images for offline access (PWA).
- **Notifications:** Use browser notifications or in-app banners for new posts, updates, or comments.
- **Commenting System:** Integrate a privacy-friendly commenting solution or custom system with moderation.
- **Internationalization (i18n):** Prepare for multi-language support using libraries like `react-i18next`.
- **Performance Optimization:** Use code splitting, lazy loading, and image optimization. Audit with Lighthouse and WebPageTest.
- **Security:** Implement rate limiting, input sanitization, and secure headers. Use HTTPS and monitor vulnerabilities.
- **Testing:** Add unit, integration, and accessibility tests. Use Jest, React Testing Library, and Cypress.

### Content Strategy

- **Featured Posts & Categories:** Highlight trending or featured posts on the homepage. Use curated categories for discovery.
- **Related Posts:** Show related or recommended posts at the end of each article.
- **Author/Editor Notes:** Add admin notes or editorial highlights for context.
- **Newsletter Signup:** Offer email subscription for updates and new posts.
- **Inclusive Copywriting:** Use friendly, inclusive language and clear calls to action.

---

```
blog-backend/
│
├── server.ts
├── config/           # DB, environment, logging configs
├── controllers/      # Route handlers (posts, authors)
├── middlewares/      # Validation, error handling, logging
├── models/           # Mongoose schemas (Post, Author)
├── routes/           # Express routers
├── services/         # Business logic, reusable functions
├── utils/            # Helpers (SEO, JSON-LD, etc.)
├── tests/            # Unit/integration tests
└── README.md
```

### Key Models


**Post**
- title, slug, summary, content, coverImage, tags, categories, publishDate, seoMeta
- postedBy: "admin" (all posts are published by the app admin)

### API Endpoints


`GET /api/posts` — List posts (filter by category, tag, location, paginated)
`GET /api/posts/:slug` — Get single post (SEO-friendly)
`POST /api/posts` — Create post (validation)
`PUT /api/posts/:id` — Update post
`DELETE /api/posts/:id` — Delete post
`POST /api/webhook/cms-sync` — (Optional) CMS sync webhook

### Best Practices

- **Validation:** Use `express-validator` or custom middleware for request validation.
- **Error Handling:** Centralized error middleware, consistent error responses.
- **Logging:** Use `winston` or similar for request/response logging.
- **Service Layer:** All business logic in `services/`, controllers only handle HTTP.
- **SEO & JSON-LD:** Generate structured data in responses for posts.
- **Modularity:** No coupling to other app features; all blog logic is standalone.

---

## Frontend: Blog Micro-Frontend

**Tech Stack:** React + TypeScript + Tailwind CSS  
**Integration:** Module Federation remote (Webpack 5)

### Folder Structure

```
blog-frontend/
│
├── SEOHead.tsx           # Dynamic meta tags, JSON-LD
├── components/           # UI components (PostList, PostItem, AuthorInfo, etc.)
├── hooks/                # Custom hooks (usePosts, useAuthors)
├── pages/                # Views ([slug].tsx, index.tsx)
├── services/             # API calls (api.ts)
├── styles/               # Tailwind config, custom styles
├── utils/                # Helpers (formatting, SEO)
├── public/               # Static assets
└── README.md
```

### Key Components

- **PostList:** Paginated, filterable list of posts
- **PostItem:** Card for individual post
- **AuthorInfo:** Author details
- **Tag, CategoryFilter:** Filtering UI
- **Breadcrumbs:** Navigation
- **SEOHead:** Dynamic meta tags, OpenGraph, Twitter, JSON-LD
- **Button, Card:** Reusable UI primitives

### UI/UX Best Practices


## Advanced UI/UX Best Practices (Expert Recommendations)

- **Stateless, Modular Components:** Build UI as small, reusable, stateless components. Use clear prop interfaces and avoid side effects in rendering.
- **Consistent Design System:** Use a design system for colors, typography, spacing, and UI elements. Leverage Tailwind CSS utility classes for consistency.
- **Responsive & Mobile-First:** Design layouts for mobile screens first, then scale up for tablets/desktops. Use fluid grids, flexible images, and media queries.
- **Modern Typography:** Use readable font sizes, line heights, and weights. Limit font families for clarity. Ensure sufficient contrast for accessibility.
- **Whitespace & Visual Hierarchy:** Use generous spacing and padding. Group related elements, highlight key actions, and guide the eye with headings and cards.
- **Accessible Design:** Ensure keyboard navigation, focus indicators, alt text for images, ARIA roles for interactive elements, and color contrast compliance (WCAG AA+).
- **Interactive Feedback:** Provide clear hover, focus, and active states for buttons, links, and cards. Use subtle transitions and animations for feedback.
- **Optimized Images:** Use lazy loading, responsive image sizes (`srcset`), and modern formats (WebP/AVIF). Show placeholders or skeleton loaders for slow images.
- **Fast Load & Performance:** Minimize bundle size, use code splitting, and prefetch critical resources. Avoid layout shifts and ensure smooth scrolling.
- **Error & Empty States:** Design clear, friendly error messages and empty states with helpful actions or illustrations.
- **Forms & Validation:** Use clear labels, inline validation, and accessible error messages. Group related fields and provide logical tab order.
- **Micro-Interactions:** Add subtle animations for actions (e.g., liking, filtering, loading). Use motion to guide attention, but avoid distraction.
- **Dark Mode Support:** Provide a toggle for dark/light themes, respecting user OS preferences.
- **Content Readability:** Limit line length, use bullet points/lists, and break up long text with headings and images.
- **Breadcrumbs & Navigation:** Always show user location in the app. Use breadcrumbs, sticky headers, and clear navigation paths.
- **Inclusive Language:** Use friendly, inclusive copywriting throughout the UI.
- **Testing & Feedback:** Test UI with real users, gather feedback, and iterate. Use tools like Lighthouse, axe, and browser dev tools for audits.

---

### API Integration

- All API calls via `services/api.ts` using fetch/axios.
- Hooks like `usePosts`,  encapsulate data fetching and state.

---

## Integration Instructions

### Backend

1. **Run MongoDB** and set connection string in `config/`.
2. **Install dependencies:**  
   ```bash
   cd blog-backend
   npm install
   ```
3. **Start server:**  
   ```bash
   npm run start
   ```
4. **API available at:** `/api/posts`, `/api/authors`, etc.

### Frontend

1. **Install dependencies:**  
   ```bash
   cd blog-frontend
   npm install
   ```
2. **Configure Module Federation:**  
   - Expose blog components as remotes in `webpack.config.js`.
   - Example:
     ```js
     // webpack.config.js
     module.exports = {
       // ...existing config...
       plugins: [
         new ModuleFederationPlugin({
           name: 'blog',
           filename: 'remoteEntry.js',
           exposes: {
             './PostList': './components/PostList',
             './SEOHead': './SEOHead',
             // ...other components
           },
           // ...shared config...
         }),
       ],
     }
     ```
3. **Integrate into RAIH shell:**  
   - Import remote components via Module Federation in the host app.
   - Example:
     ```js
     // In RAIH shell
     const BlogPostList = React.lazy(() => import('blog/PostList'));
     ```
4. **Run frontend:**  
   ```bash
   npm run start
   ```

---

## References

- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Module Federation Docs](https://webpack.js.org/concepts/module-federation/)
- [React + Tailwind CSS](https://tailwindcss.com/docs/guides/create-react-app)
- [Express + TypeScript](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## Summary

- **Backend:** Modular, scalable Node.js/TypeScript service with clear separation, validation, error handling, SEO, and JSON-LD.
- **Frontend:** Micro-frontend React app, stateless components, hooks, Tailwind styling, advanced SEO, ready for Module Federation.
- **Integration:** Simple, independent, developer-friendly, and scalable for future features.

---

**For full code samples, see the provided folder structures and files.**  
This setup ensures your travel blog is robust, maintainable, and easy to integrate as a standalone feature in RAIH.
