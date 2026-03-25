# Leaderboard Page — Design Spec

## Problem

The `/leaderboard` page (`src/app/leaderboard/page.tsx`) currently uses hardcoded data (5 static entries). It needs to be connected to the database via tRPC, displaying 20 results with collapsible entries and server-side syntax highlighting — matching the pattern already established on the homepage.

## Approach

**Reuse existing components.** The homepage already has a working dynamic leaderboard with collapsible entries + shiki syntax highlighting. We extend this pattern to the full leaderboard page with minimal changes.

## Changes

### 1. `src/components/leaderboard-preview.tsx`

Add optional `limit` prop (default `3`):

- Interface: `{ limit?: number }`
- Pass `limit` to `caller.leaderboard.getLeaderboard({ limit })`
- Update `displayCount` to use `Math.min(totalSubmissions, limit)`
- No other changes to rendering logic

### 2. `src/app/leaderboard/page.tsx`

Rewrite from hardcoded data to dynamic server component:

- Remove hardcoded `ENTRIES` array and `ScoreColor` function
- Import `LeaderboardPreview`, `LeaderboardSkeleton`, `Stats`
- Render hero section with `Stats` component (dynamic)
- Wrap `LeaderboardPreview` in `<Suspense>` with `LeaderboardSkeleton` fallback
- Pass `limit={20}` to `LeaderboardPreview`
- Keep existing visual structure: hero section + entries section

### No changes needed

- `src/trpc/routers/leaderboard.ts` — `getLeaderboard` already accepts `limit` parameter
- `src/components/leaderboard-entry.tsx` — reusable as-is
- `src/components/leaderboard-entry-content.tsx` — reusable as-is
- `src/components/leaderboard-skeleton.tsx` — reusable as-is (shows 3 skeleton rows, acceptable)

## Data Flow

```
LeaderboardPage (server component)
  ├─ Stats (server → calls caller.leaderboard.stats())
  └─ LeaderboardPreview({ limit: 20 }) (server)
       ├─ caller.leaderboard.getLeaderboard({ limit: 20 }) → DB query
       ├─ caller.leaderboard.stats() → DB query
       └─ LeaderboardEntry × 20 (client, collapsible)
            └─ LeaderboardEntryContent (server, shiki highlighting)
```

## Edge Cases

- **Fewer than 20 submissions**: `displayCount` shows actual count (e.g., "showing 5 of 5")
- **No submissions**: Empty state message from `LeaderboardPreview`
- **Loading**: `LeaderboardSkeleton` shows 3 pulsing rows during SSR streaming

## Verification

1. `npm run dev` — page loads with real data from DB
2. Collapsible entries expand/collapse with shiki highlighting
3. Stats show dynamic numbers from database
4. Homepage leaderboard preview still works (limit defaults to 3)
5. `npm run lint` passes
6. `npm run build` passes
