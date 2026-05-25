# Simple Blog Telemetry Tracker

A small Next.js MVP that tracks anonymous blog page views and exposes a private analytics dashboard.

## Stack

- Next.js App Router
- TypeScript
- Prisma
- SQLite
- HTTP Basic Auth for `/admin/analytics`

## Features

- Anonymous `page_view` tracking with `sendBeacon` and `fetch` fallback
- Required payload validation on `POST /api/telemetry`
- Privacy-conscious storage with no raw IP addresses
- Admin-only dashboard at `/admin/analytics`
- Date range filters for Today, Last 7 Days, Last 30 Days, and All Time
- Summary cards, top pages, top referrers, daily views, device breakdown, and browser breakdown

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and adjust credentials:

```bash
cp .env.example .env
```

3. Generate the Prisma client and create the SQLite database:

```bash
npm run db:generate
npm run db:push
```

4. Start the development server:

```bash
npm run dev
```

5. Open:

- Blog: `http://localhost:3000`
- Dashboard: `http://localhost:3000/admin/analytics`

Use the `ADMIN_USERNAME` and `ADMIN_PASSWORD` values from `.env` for the dashboard prompt.

## Privacy Notes

- Visitor IDs are anonymous and stored in `localStorage`.
- Session IDs are anonymous and stored in `sessionStorage`.
- The API does not read or persist raw IP addresses.
- No names, emails, or logged-in identities are collected.
- Data stays inside the app and is not forwarded to third-party analytics providers.
