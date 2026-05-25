# Codebase and Product Overview

## Product Summary

This repository is a small MVP for privacy-conscious blog analytics. It tracks anonymous `page_view` events from blog pages and exposes a private analytics dashboard for an admin user.

The current implementation is a self-contained demo app rather than an integration into an existing blog. It includes:

- A public homepage with sample blog posts
- Dynamic sample post pages under `/blog/[slug]`
- A telemetry ingestion API at `/api/telemetry`
- A private dashboard at `/admin/analytics`

The product is designed around lightweight, first-party analytics. It does not collect names, emails, logged-in identities, or raw IP addresses, and it does not send analytics data to third-party providers.

## Tech Stack

- Framework: Next.js 15 App Router
- Language: TypeScript
- UI: Server-rendered React with a single client telemetry component
- Database: SQLite via Prisma
- Auth/protection: HTTP Basic Auth enforced in Next.js middleware
- Styling: Global CSS in `app/globals.css`

## Repository Structure

```txt
app/
  admin/analytics/page.tsx      Private analytics dashboard
  api/telemetry/route.ts        Telemetry ingestion endpoint
  blog/[slug]/page.tsx          Dynamic sample blog post page
  globals.css                   Shared styling
  layout.tsx                    Root layout and global tracker mount
  not-found.tsx                 404 page
  page.tsx                      Homepage
components/
  PrivacyNote.tsx               Reusable privacy notice
  TelemetryTracker.tsx          Client-side page view tracker
lib/
  admin.ts                      Basic auth helpers
  analytics.ts                  Dashboard query and aggregation helpers
  date-range.ts                 Range normalization and date helpers
  prisma.ts                     Prisma client singleton
  sample-posts.ts               Demo post content
  telemetry.ts                  Telemetry types, validation, sanitization, UA parsing
prisma/
  schema.prisma                 SQLite schema for telemetry events
middleware.ts                   Admin route protection
README.md                       Setup instructions
```

## Route Map

- `/`
  - Landing page for the demo blog
  - Links to sample posts
  - Links to the analytics dashboard

- `/blog/[slug]`
  - Renders sample post content from `lib/sample-posts.ts`
  - Uses `notFound()` for invalid slugs
  - Tracked by the global telemetry client

- `/api/telemetry`
  - `POST` endpoint for telemetry ingestion
  - Accepts JSON payloads
  - Validates required fields and stores valid events in Prisma

- `/admin/analytics`
  - Private analytics dashboard
  - Protected by middleware using `ADMIN_USERNAME` and `ADMIN_PASSWORD`
  - Supports range selection through `?range=today|7d|30d|all`

## Telemetry Flow

1. `TelemetryTracker` is mounted globally in `app/layout.tsx`.
2. On client-side route load, it skips `/admin` paths and sends a `page_view` event for all other pages.
3. The tracker:
   - Reads or creates an anonymous `visitorId` in `localStorage`
   - Reads or creates an anonymous `sessionId` in `sessionStorage`
   - Collects `url`, `path`, `title`, `referrer`, `timestamp`, and `userAgent`
4. It sends the payload with `navigator.sendBeacon` first and falls back to `fetch(..., { keepalive: true })`.
5. Failures are intentionally silent so analytics never affect page rendering or navigation.

## Telemetry Payload

Current payload shape in `lib/telemetry.ts`:

- Required
  - `eventType`
  - `url`
  - `path`
  - `timestamp`
  - `visitorId`
  - `sessionId`

- Optional
  - `title`
  - `referrer`
  - `userAgent`
  - `deviceType`
  - `browser`
  - `os`

Supported event types:

- `page_view`

## Validation and Privacy Behavior

The telemetry validation layer in `lib/telemetry.ts`:

- Trims and length-limits string fields
- Requires `eventType === "page_view"`
- Requires a valid `http` or `https` URL
- Requires a valid timestamp
- Normalizes `path` to begin with `/`
- Parses coarse `deviceType`, `browser`, and `os` from the user agent when not explicitly provided

Privacy-related behavior currently implemented:

- Anonymous visitor ID only
- Anonymous session ID only
- No raw IP storage
- No identity or account linkage
- No third-party analytics forwarding
- Reusable on-page privacy note component

## Database Model

The Prisma schema defines a single `TelemetryEvent` model:

- `id`
- `eventType`
- `url`
- `path`
- `title`
- `referrer`
- `visitorId`
- `sessionId`
- `userAgent`
- `deviceType`
- `browser`
- `os`
- `occurredAt`
- `createdAt`

Indexes:

- `occurredAt`
- `path, occurredAt`
- `visitorId, occurredAt`

This is a raw-events-only design. No pre-aggregated tables or caching layers are present.

## Dashboard Behavior

The dashboard is server-rendered and uses `getAnalyticsSummary(range)` from `lib/analytics.ts`.

Current dashboard outputs:

- Metric cards
  - Total Views
  - Unique Visitors
  - Top Referrer
  - Most Viewed Page

- Detailed sections
  - Views over time
  - Device breakdown
  - Top pages
  - Top referrers
  - Browser breakdown

Aggregation approach:

- Reads matching events from Prisma for the selected time range
- Aggregates in application code using `Map` and `Set`
- Uses `visitorId` sets to compute unique visitors per page and globally
- Groups empty referrers as `Direct / Unknown`
- Groups by UTC day using `occurredAt.toISOString().slice(0, 10)`

Supported date ranges:

- `today`
- `7d`
- `30d`
- `all`

Default date range:

- `7d`

## Admin Protection

`middleware.ts` protects all `/admin/*` routes.

Behavior:

- If admin credentials are missing, `/admin` responds with `503`
- If credentials are wrong or missing, `/admin` responds with `401`
- A `WWW-Authenticate` header triggers the browser basic auth prompt

Required environment variables:

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## UI and UX Notes

The UI is intentionally simple and editorial in tone:

- Serif typography
- Warm neutral color palette
- Card-based layout
- Responsive CSS without a component library

The homepage and blog content are demo fixtures, not CMS-backed content.

## Current Scope vs Original Prompt

The codebase satisfies the core MVP intent of the original prompt:

- Client-side page-view tracking
- Telemetry ingestion API
- Persistent event storage
- Private analytics dashboard
- Date range filtering
- Privacy note and privacy-conscious defaults
- Simple admin protection

Notable implementation choices:

- The app uses SQLite because there was no prior database setup
- The dashboard is a simple server-rendered page with tables/lists instead of a chart library
- Device/browser/OS are inferred with lightweight string parsing instead of a third-party analytics dependency
- The blog itself is sample content inside the same repo

## Known Gaps and Limitations

These are the main limitations in the current repository:

- No automated tests are present
- No Prisma migration files are checked in; setup relies on `prisma db push`
- No production-focused rate limiting, bot filtering, or abuse controls
- No separate admin layout or session-based auth; access relies only on HTTP Basic Auth
- Dashboard aggregation loads matching events into memory, which is acceptable for the stated MVP scale but not ideal for larger datasets
- Daily grouping uses UTC date boundaries, which may differ from an admin's local timezone expectations
- The tracker is mounted globally, so the homepage is also tracked, not only blog post pages
- The dashboard link is visible on the homepage even though the route itself is protected

## Operational Notes

Useful commands from `package.json`:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run db:generate`
- `npm run db:push`

Local setup depends on:

- `.env` based on `.env.example`
- Prisma client generation
- SQLite database creation via Prisma

## Recommended Next Documentation Targets

If this project continues beyond the demo stage, the next useful docs would be:

- Deployment and environment setup guide
- Data retention and privacy policy notes
- Test plan for telemetry ingestion and dashboard accuracy
- Scaling notes for moving aggregation work into database queries
