# Tsidat Resident App

This Expo app is the resident mobile experience for Tsidat. It uses the same Supabase project, authentication, Postgres database, and private photo buckets as the web app. Residents can sign in with an existing web account or create a resident account that can also be used on the web.

## Setup

1. Install dependencies with `npm install`.
2. Create `tsidat/.env` from `.env.example` and copy the values of `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the web app's root `.env` into `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Start the app with `npm start`.

The local `.env` is ignored by Git. Only the public Supabase URL and publishable key belong in this file; never put a service-role key in a mobile app.

## Resident features

- View and refresh your report list, status, photo, and location.
- Create a report with a photo, category, description, service area, and GPS pin.
- Follow status history, view collection proof, and rate completed reports.
- Edit your resident profile and sign out.

The database remains authoritative for authorization. The app relies on the existing resident row-level security and storage policies and does not make administrative or worker workflow changes directly.
