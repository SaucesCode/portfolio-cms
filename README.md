# James Patrick De Mesa — Portfolio & CMS

A full-stack developer portfolio with a custom content management system. The public site is an editorial, handcrafted experience; the admin panel ("Workbench") is a purpose-built productivity tool for managing it. Both share one design system and are backed by a single Express + PostgreSQL API.

**Live site:** https://jamespatrickdemesa.vercel.app/
**Admin:** `/admin`

---

## Table of contents

- [James Patrick De Mesa — Portfolio \& CMS](#james-patrick-de-mesa--portfolio--cms)
  - [Table of contents](#table-of-contents)
  - [Overview](#overview)
  - [Tech stack](#tech-stack)
  - [Project structure](#project-structure)
  - [Getting started](#getting-started)
  - [Environment variables](#environment-variables)
  - [Publishing Workflow](#publishing-workflow)
  - [Content modules](#content-modules)
  - [Adding a new content module](#adding-a-new-content-module)
  - [API Reference](#api-reference)
    - [Public API](#public-api)
    - [Admin API](#admin-api)
  - [Design system](#design-system)
  - [Scripts](#scripts)
  - [Deployment](#deployment)

---

## Overview

This repo contains two products sharing one codebase and one database:

- **The public portfolio** (`client/src`, routes `/` and `/blog/:slug`) — an editorial, asymmetric-layout site built around a single visual identity: warm paper backgrounds, one signal accent color, a serif-italic accent word, and monospace used for structural/technical detail. No card grids, no gradients, no glassmorphism.
- **The Workbench** (`client/src/pages/admin`, routes `/admin/*`) — a calm, dense, rounded-corner CMS with its own visual grammar (same color tokens as the portfolio, opposite geometry and pacing), built for daily content management rather than storytelling.

Both consume the same Express API (`server/`) backed by PostgreSQL via Prisma.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, React Router, TanStack Query, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT in an httpOnly cookie, bcrypt password hashing |
| Content editing | `react-simplemde-editor` (markdown) for Blog |
| Rendering | `react-markdown` + `rehype-highlight` for published posts |

## Project structure

```text
├── client/
│   └── src/
│       ├── components/
│       │   ├── admin/        # Shared Workbench primitives
│       │   ├── layout/
│       │   ├── sections/
│       │   └── effects/
│       ├── pages/
│       │   ├── admin/
│       │   └── BlogPost.jsx
│       ├── hooks/
│       ├── services/
│       └── context/
│
├── server/
│   ├── routes/
│   │   └── admin/
│   ├── lib/
│   │   ├── prisma.js
│   │   ├── publishing.js
│   │   ├── publishingRoutes.js
│   │   └── singleton.js
│   ├── middleware/
│   │   └── auth.js
│   └── prisma/
│       ├── schema.prisma
│       ├── migrations/
│       └── seed.js
│
└── README.md
```

## Getting started

**Prerequisites:** Node 18+, a PostgreSQL database (local or hosted, e.g. Neon/Railway).

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Configure environment variables (see below)
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Run migrations and seed initial data
cd server
npx prisma migrate deploy
npm run seed

# 4. Start both apps (separate terminals)
cd server && npm run dev      # http://localhost:3001
cd client && npm run dev      # http://localhost:5173
```

The seed script creates one admin user:
email:    admin@portfolio.com
password: changeme123

**Change this password immediately** in a real deployment — there's no self-serve reset flow yet, so update it directly via `bcrypt.hash()` in a script or through the database if the login form isn't reachable.

## Environment variables

**`server/.env`**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_db
JWT_SECRET=a-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PORT=3001

GITHUB_USERNAME=your-github-username
GITHUB_TOKEN=ghp_a_read_only_personal_access_token
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:3001
VITE_GITHUB_USERNAME=your-github-username
VITE_SITE_URL=http://localhost:5173
```

## Publishing Workflow

```text
                publish
DRAFT ─────────────────────────► PUBLISHED
  │                                │
  │ schedule                       │ archive
  ▼                                ▼
SCHEDULED ──(scheduled time)──► PUBLISHED ─────► ARCHIVED
                                      │
                                      │ unpublish
                                      ▼
                                   DRAFT
```

- **`status`** (`ContentStatus` enum: `DRAFT | SCHEDULED | PUBLISHED | ARCHIVED`) — the current lifecycle state.
- **`publishedAt`** — when a record *first* went live. Preserved across unpublish/republish, so "on the site since March" stays true even after a later draft edit.
- **`scheduledAt`** — only meaningful while `SCHEDULED`.
- **`archivedAt`** — when a record was retired.

**No background worker is required.** `promoteDueScheduled(prisma, modelName)` (`server/lib/publishing.js`) checks for any `SCHEDULED` row whose time has passed and flips it to `PUBLISHED`. It's called at the top of every public list route (and the equivalent admin list route), so scheduled content goes live within the delay of the next page load — no cron job to run or monitor.

**Public routes only ever return `status: "PUBLISHED"` records.** Admin routes return every status. Editing a record's fields (`PATCH /admin/<module>/:id`) never changes its `status` — every admin route explicitly strips `status`/`publishedAt`/`scheduledAt`/`archivedAt` from the request body before saving, so lifecycle changes can only happen through the dedicated transition endpoints (`/:id/publish`, `/:id/unpublish`, `/:id/schedule`, `/:id/archive`).

**Not every model uses this.** `Hero` (a singleton profile record) and `Stat` (always-current numbers) intentionally have no `status` field at all — there's no meaningful "draft" state for a single settings record or a live counter, so they're plain CRUD instead. `Message` (inbox) uses a simple `isRead` boolean for the same reason: read/unread isn't a publishing lifecycle.

## Content modules

| Module | Lifecycle | Manual reorder | Notes |
|---|---|---|---|
| Hero | None (singleton) | — | One record, always current. Includes a live preview in the editor. |
| Projects | Full | Yes | Grid/list toggle, GitHub auto-fill, per-project sync. |
| Skills | Full | Yes (up/down) | Inline proficiency editing, no full-form reopen needed. |
| Experience | Full | Tiebreaker only | Sort order is date-driven (`isCurrent desc, startDate desc`); `orderIndex` only breaks ties on identical dates. Enforces a single `isCurrent` row via `enforceSingleton()`. |
| Certifications | Full | Yes | Badge-led rows; default sort is most-recently-issued. |
| Testimonials | Full | Yes (up/down) | Curated order matters for the public carousel. |
| Blog | Full | No (date-ordered) | Dedicated editor page with a markdown editor, not an inline form. |
| Stats | None | — | Plain numbers; no draft state. |
| Messages (Inbox) | `isRead` only | — | Not a publishing lifecycle — read/unread. |

## Adding a new content module

This is the fast path, assuming the module needs the full publishing lifecycle:

1. **Schema** — add the model with the standard publishing fields (`status`, `publishedAt`, `scheduledAt`, `archivedAt`, `createdAt`, `updatedAt`, `createdById`, `updatedById`) plus its own content fields. Add the two relation fields to `AdminUser`. Run a migration — if converting an existing boolean flag (like `Blog`'s old `published` or `Testimonial`'s old `visible`), migrate the data before dropping the old column.
2. **Admin routes** — write plain CRUD (`GET`/`POST`/`PATCH`/`DELETE`) for the model's own fields, then call `attachPublishingRoutes(router, prisma, "modelName")` and, if manual ordering makes sense for this content, `attachReorderRoute(...)`. The four lifecycle transitions and reorder logic are entirely inherited — do not reimplement them.
3. **Public route** — filter `where: { status: "PUBLISHED" }` and call `promoteDueScheduled(prisma, "modelName")` first.
4. **Admin UI** — reuse `PageHeader`, `EmptyState`, `StatusTabs`, `PublishBadge`, `PublishMenu`, and `createPublishingApi()` / `usePublishingActions()` from `client/src/services/publishing.js` and `client/src/hooks/usePublishingActions.js`. Design the list layout around what the content actually is (a table for tabular data, a badge-led list for credentials, a chronological log for a timeline) rather than copying another module's layout wholesale.
5. **Navigation** — add the module to **both** `NAV_GROUPS` in `AdminLayout.jsx` and `CONTENT_LINKS` in `Dashboard.jsx`. These are currently two independently-maintained lists — a module can have a working route and still be invisible in the sidebar if it's missing from `NAV_GROUPS`. This has happened twice already (Hero, Stats). If adding a third module and this bites again, it's worth deriving both lists from one shared `ADMIN_MODULES` array instead of continuing to maintain them by hand.

## API Reference

### Public API
_Read-only. Only returns content with `status = PUBLISHED`._

```text
GET    /api/hero

GET    /api/projects
GET    /api/projects/:id

GET    /api/skills
GET    /api/experiences
GET    /api/certifications
GET    /api/testimonials
GET    /api/stats

GET    /api/blog
GET    /api/blog/:slug

GET    /api/github/pinned
GET    /api/github/contributions

POST   /api/contact
```

### Admin API
_Protected via JWT authentication (httpOnly cookie)._

```text
Authentication
────────────────────────────────────────────────────────────
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

Hero
────────────────────────────────────────────────────────────
PATCH  /api/admin/hero

Content Modules
────────────────────────────────────────────────────────────
Modules:
projects
skills
experiences
certifications
testimonials
blog

GET    /api/admin/<module>
POST   /api/admin/<module>

PATCH  /api/admin/<module>/:id
DELETE /api/admin/<module>/:id

PATCH  /api/admin/<module>/:id/publish
PATCH  /api/admin/<module>/:id/unpublish
PATCH  /api/admin/<module>/:id/schedule
        Body:
        {
          "scheduledAt": "ISO Date"
        }

PATCH  /api/admin/<module>/:id/archive

PATCH  /api/admin/<module>/reorder
        Body:
        {
          "items": [
            {
              "id": 1,
              "orderIndex": 0
            }
          ]
        }

Stats
────────────────────────────────────────────────────────────
GET    /api/admin/stats
POST   /api/admin/stats
PATCH  /api/admin/stats/:id
DELETE /api/admin/stats/:id

Messages
────────────────────────────────────────────────────────────
GET    /api/admin/messages
GET    /api/admin/messages/:id
PATCH  /api/admin/messages/:id
DELETE /api/admin/messages/:id

GitHub
────────────────────────────────────────────────────────────
POST   /api/admin/github/sync
GET    /api/admin/github/sync-status
```

## Design system

Both products share one set of CSS custom properties (`client/src/index.css`):

```css
--background   /* paper (light) / near-black (dark) */
--foreground   /* ink */
--rule         /* border/divider color */
--signal       /* the one accent color — used for links, active states, CTAs */
--signal-warm  /* rare secondary highlight — availability badges, pull-quotes */
--muted        /* subtle fill */
```

**Portfolio**: sharp corners (`--radius: 0.25rem`), Fraunces italic for accent words, JetBrains Mono for structural/technical labels, generous whitespace, no card containers.

**Workbench**: rounded corners (`--radius: 10px` via inline override in `AdminLayout`), plain grotesk throughout (no serif italic), dense spacing, tables/lists over decorative cards. Same color tokens, deliberately opposite geometry — the two products should read as siblings, never as the same thing.

## Scripts

**`server/package.json`**

```bash
npm run dev     # nodemon, auto-restart on change
npm run start   # production start
npm run seed    # reset and repopulate the database with sample content
```

**`client/package.json`**

```bash
npm run dev       # Vite dev server
npm run build     # production build
npm run preview   # preview the production build locally
```

## Deployment

Deploy the backend first — the frontend needs a live API URL before it can be built.

1. **Backend**: any Node host with a PostgreSQL database (Railway, Render, Fly.io). Set all `server/.env` variables in the platform's environment settings. Start command should run migrations before starting the server: `npx prisma migrate deploy && node index.js`.
2. **Frontend**: any static host (Vercel, Netlify, Cloudflare Pages). Set `VITE_API_URL` to the deployed backend's URL.
3. Set `CLIENT_URL` on the backend to the deployed frontend's URL (required for CORS) and redeploy the backend once the frontend URL is known.
4. Verify: `GET /` on the backend returns `{ ok: true }`; the frontend loads and `/admin` requires login.