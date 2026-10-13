# Field Survey PWA

An installable web app for collecting geotagged field observations (potholes, illegal dumping, flooding, tree health, other) that keeps working without a network connection and syncs when the device comes back online.

**Live:** https://field-survey-pwa-theta.vercel.app (sign-up required)

## Features

- GPS location capture with an accuracy readout
- Observation type, severity rating (1–5), description and an optional photo
- **Offline-first:** submissions are queued in IndexedDB, including the photo blob, and uploaded automatically when connectivity returns; an offline banner shows the queue state
- Live map of all observations (Leaflet) with real-time updates through Supabase Realtime
- Dashboard with observation counts by type
- Export to **CSV** or **GeoJSON** (`/api/export?format=geojson`)
- Per-user "My surveys" view, with Supabase Auth

## How sync works

1. `lib/offline/queue.ts` stores each pending observation in IndexedDB (`idb`).
2. `hooks/useOnlineStatus.ts` watches connectivity; on reconnect `lib/offline/sync.ts` uploads any photo to Supabase Storage, inserts the row, and removes the item from the queue only once the insert succeeds.
3. Failed items stay queued and are retried on the next reconnect.

## Stack

Next.js (App Router) · TypeScript · Supabase (Postgres, Auth, Storage, Realtime) · Leaflet / react-leaflet · IndexedDB (`idb`) · react-hook-form + zod · next-pwa

## Run locally

Create `.env.local` with:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

```bash
bun install
bun run dev
```

The Supabase project needs an `observations` table and a public `survey-photos` storage bucket.
