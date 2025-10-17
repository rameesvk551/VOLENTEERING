## Volunteering Micro-Frontend Migration Guide

This guide explains how to extract the volunteering domain (host and volunteer journeys) from the monolithic `client` application into an independently deployed micro-frontend. The end-state is a single `volunteering` micro-app that owns both host- and volunteer-facing experiences, delivered through the existing Module Federation shell in `travel-ecosystem/shell`.

---

### 1. Goals
- Decouple volunteering pages from the main `client` bundle to improve deploy velocity and ownership.
- Provide an integration contract so the shell can lazy-load volunteering screens as a remote module.
- Preserve existing Redux state, routing, and API integrations while enabling incremental migration.

---

### 2. Target Architecture
- **New app:** `travel-ecosystem/apps/volunteering`
	- Entry: `bootstrap.tsx` exporting `VolunteeringRouter` (Module Federation exposed module `./Router`).
	- Pages: `host/` and `volunteer/` directories that wrap existing flows (`HostAddDetailsPage`, `VolenteerAddDetails`, etc.).
	- Shared UI lives under `components/` and is imported from the monorepo `shared/` package where possible.
- **Shell integration:** `travel-ecosystem/shell/src/mfe/volunteering.ts`
	- Registers the remote via Module Federation (`volunteering@${VOLUNTEERING_MFE_URL}/remoteEntry.js`).
	- Adds routes `/volunteering/*`, `/host/*`, and `/volunteer/*` that delegate to the remote router.
- **Legacy client impact:** Routes in `client/src/App.tsx` become thin wrappers that redirect into the shell URLs, ensuring backward compatibility while the edge routing layer is updated.

---

### 3. Implementation Steps

**Step 1 – Scaffold the app**
1. Copy `travel-ecosystem/apps/blog` as a baseline into `apps/volunteering`.
2. Remove blog-specific code and keep only Vite config, ESLint, Tailwind, and shared dependencies.
3. Update `package.json`:
	 ```json
	 {
		 "name": "@travel-ecosystem/volunteering",
		 "scripts": {
			 "dev": "vite --mode development",
			 "build": "vite build",
			 "preview": "vite preview"
		 },
		 "dependencies": {
			 "react": "^18.x",
			 "react-dom": "^18.x",
			 "react-router-dom": "^6.x",
			 "@reduxjs/toolkit": "^1.9.x",
			 "react-redux": "^8.x"
		 }
	 }
	 ```

**Step 2 – Configure Module Federation**
1. In `apps/volunteering/vite.config.ts`, expose the router module:
	 ```ts
	 federation({
		 name: "volunteering",
		 filename: "remoteEntry.js",
		 exposes: { "./Router": "./src/bootstrap.tsx" },
		 shared: mfShared
	 });
	 ```
2. Ensure shared dependencies (`react`, `react-dom`, `react-router-dom`, `@reduxjs/toolkit`, `react-redux`) are marked as singletons.

**Step 3 – Port application logic**
1. Copy volunteering-specific Redux slices, thunks, and helpers from `client/src/redux` into `apps/volunteering/src/redux`.
2. Move volunteering pages from `client/src/pages/host` and `client/src/pages/user/Volenteer*` into `apps/volunteering/src/pages`.
3. Create a `src/bootstrap.tsx` that sets up the Redux provider, React Router routes, and exports the `VolunteeringRouter` component.
4. Wrap host and volunteer flows in nested routes:
	 ```tsx
	 <Routes>
		 <Route path="host/*" element={<HostRoutes />} />
		 <Route path="volunteer/*" element={<VolunteerRoutes />} />
	 </Routes>
	 ```

**Step 4 – Adapt API integration**
- Update axios base URLs or fetch clients to use environment variables scoped to the new app (`VITE_VOLUNTEERING_API_URL`).
- Abstract shared utilities into `travel-ecosystem/shared` when they are consumed by multiple micro-apps.

**Step 5 – Wire into the shell**
1. Edit `shell/vite.config.ts` to add the remote:
	 ```ts
	 remotes: {
		 volunteering: `${process.env.VOLUNTEERING_REMOTE_URL}/remoteEntry.js`
	 }
	 ```
2. Create a lazy boundary:
	 ```tsx
	 const VolunteeringApp = lazy(() => import("volunteering/Router"));
	 ```
3. Register routes in `shell/src/routes.tsx`:
	 ```tsx
	 <Route path="/volunteering/*" element={<VolunteeringApp />} />
	 <Route path="/host/*" element={<VolunteeringApp />} />
	 <Route path="/volunteer/*" element={<VolunteeringApp />} />
	 ```

**Step 6 – Update legacy entry points**
- In `client/src/App.tsx`, replace volunteering pages with redirects:
	```tsx
	<Route path="/host/*" element={<Navigate to="/volunteering/host" replace />} />
	<Route path="/volenteer/*" element={<Navigate to="/volunteering/volunteer" replace />} />
	```
- Once DNS/routing is updated to hit the shell directly, the legacy routes can be removed entirely.

---

### 4. Data & State Contracts
- **Redux store:** Export a `createStore` helper that the shell can augment if cross-MFE state sharing is required. Prefer keeping volunteering state local to the micro-app.
- **Authentication:** Consume shared auth tokens via the `@travel-ecosystem/shared-auth` helpers. If host/volunteer roles require additional claims, define them in a shared TypeScript interface.
- **API schema:** Document host/volunteer REST endpoints in `apps/volunteering/docs/api-contract.md` to keep backend and frontend teams aligned.

---

### 5. Dev & CI Pipeline
- Add `volunteering` to `start-dev.sh` so `pnpm dev --filter shell` can proxy to the new remote.
- Update `docker-compose.yml` to build and run the volunteering container alongside existing apps.
- Extend CI to run `pnpm lint --filter volunteering` and `pnpm test --filter volunteering`.
- Publish the remote image or static bundle to the same CDN bucket naming convention (`volunteering/{version}/remoteEntry.js`).

---

### 6. Rollout Plan
1. **Phase 1:** Dual-run flows by proxying existing routes to the new micro-frontend while keeping a rollback toggle in the shell environment config.
2. **Phase 2:** Remove volunteering routes from the monolith and decommission redundant Redux slices.
3. **Phase 3:** Archive or delete unused components from the `client` app once traffic confirms stability.

---

### 7. Open Questions
- Do host and volunteer flows share authentication scopes, or should they be separate remotes for independent release cadence?
- Are there SEO-critical routes (`/volunteering-oppertunities`) that need static pre-rendering once migrated?
- Should shared UI pieces move to `travel-ecosystem/shared` before or after the extraction to avoid duplication?

Document any decisions in this guide so future contributors understand the micro-frontend boundaries and integration touchpoints.

---

### 8. Progress Log
- **2025-10-17:** Scaffolded the `apps/volunteering` micro-frontend with Module Federation exposure `volunteering/Router`, registered host/volunteer routes in the shell, and introduced placeholder pages ready for incremental feature porting.
