# Volunteering Micro-Frontend

This package hosts the volunteering experience (host + volunteer flows) as a standalone Vite-powered Module Federation remote.

## Local development

```bash
npm install
npm run dev
```

The micro-frontend runs on `http://localhost:5005` and exposes its router as `volunteering/Router` for the shell.

## Current status

- ✅ Routes for host and volunteer flows are registered and available to the shell (`/host/*`, `/volunteer/*`, `/volenteer/*`, `/volunteering/*`).
- 🚧 Feature components are represented by placeholders while the actual pages, Redux slices, and data layer are migrated from the legacy client.

Track migration tasks in `VOLUNTEERING_MICROFRONTEND_GUIDE.md` and update this README as portions of the experience move over.
