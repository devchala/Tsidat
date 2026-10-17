# Tsidat ጽዳት

Tsidat is a civic waste-management platform. Residents report waste with a photo and location, local teams review and assign the work, collection workers submit completion evidence, and administrators verify the result.

This repository contains two apps that use the same Supabase project, authentication, database, and private photo storage:

- **Web platform** — resident reports, worker tasks, local administration, superadmin management, planner analytics, notifications, and audit history.
- **Resident mobile app** — an Expo and React Native app for residents to submit reports, pick a location on a map or with GPS, track progress, and rate completed work. The mobile app is in [`tsidat/`](./tsidat/).

## Web app

The web app uses TanStack Start and Router, React, TypeScript, TanStack Query, and Supabase.

```sh
npm install
npm run dev
```

Configure the Supabase URL and publishable key in the root `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. In Lovable Cloud, connect the existing Supabase project to supply these values.

Other useful commands:

```sh
npm run build
npm run lint
npm test
```

## Resident mobile app

The mobile app uses Expo SDK 57 and Expo Router. See [`tsidat/README.md`](./tsidat/README.md) for mobile setup. Its local `tsidat/.env` uses the same Supabase URL and publishable key as the web app, under `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

```sh
cd tsidat
npm install
npm start
```

Residents can sign in with their existing Tsidat account on either app. The database remains authoritative for access and workflow changes; the mobile app uses the existing resident row-level security policies and private storage buckets.

## Data and access rules

- Reports are individual resident submissions. Incidents represent the underlying waste pile and can link multiple reports.
- Assignments belong to incidents; status changes propagate to linked reports and are recorded in status history.
- Administrators and workers are scoped to service locations. Superadmins manage locations and administrator memberships.
- Business-critical changes such as review, assignment, worker approval, and completion verification run through authorized Postgres functions.
- Report and completion photos are stored in private Supabase buckets and accessed through short-lived signed links.

Database schema and migrations are in [`drizzle/`](./drizzle/). Project-specific implementation rules are in [`AGENTS.md`](./AGENTS.md).
