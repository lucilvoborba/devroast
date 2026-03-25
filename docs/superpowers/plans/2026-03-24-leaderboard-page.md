# Leaderboard Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the `/leaderboard` page from hardcoded data to a dynamic server component that fetches 20 entries from the database with collapsible views and syntax highlighting.

**Architecture:** Three minimal changes — update tRPC procedure to accept `limit`, add `limit` prop to `LeaderboardPreview`, rewrite the leaderboard page as a dynamic server component.

**Tech Stack:** Next.js 16 (App Router), TypeScript 5, tRPC 11, TanStack Query 5, Drizzle ORM, Shiki

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/trpc/routers/leaderboard.ts` | Modify | Add `limit` input with zod validation to `getLeaderboard` procedure |
| `src/components/leaderboard-preview.tsx` | Modify | Accept optional `limit` prop, pass to tRPC call |
| `src/app/leaderboard/page.tsx` | Rewrite | Server component using `LeaderboardPreview` + `Stats` |

No new files created. All changes reuse existing components: `LeaderboardEntry`, `LeaderboardEntryContent`, `LeaderboardSkeleton`, `Stats`.

---

### Task 1: Update tRPC Router

**Files:**
- Modify: `src/trpc/routers/leaderboard.ts`

- [ ] **Step 1: Add zod input to `getLeaderboard` procedure**

Replace the current `getLeaderboard` procedure with one that accepts a `limit` input:

```ts
import { z } from "zod";
import { getLeaderboard, getStats } from "@/db/queries";
import { baseProcedure, createTRPCRouter } from "../init";

export const leaderboardRouter = createTRPCRouter({
	stats: baseProcedure.query(async () => {
		return getStats();
	}),
	getLeaderboard: baseProcedure
		.input(z.object({ limit: z.number().min(1).max(100) }))
		.query(async ({ input }) => {
			return getLeaderboard(input.limit);
		}),
});
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds without tRPC type errors

- [ ] **Step 3: Commit**

```bash
git add src/trpc/routers/leaderboard.ts
git commit -m "feat: add limit input to leaderboard tRPC procedure"
```

---

### Task 2: Add `limit` Prop to LeaderboardPreview

**Files:**
- Modify: `src/components/leaderboard-preview.tsx`

- [ ] **Step 1: Add `limit` prop and pass to tRPC call**

Update `LeaderboardPreview` to accept an optional `limit` prop (default `3`) and pass it to the tRPC call:

```tsx
import { LeaderboardEntry } from "@/components/leaderboard-entry";
import { LeaderboardEntryContent } from "@/components/leaderboard-entry-content";
import { caller } from "@/trpc/server";

export async function LeaderboardPreview({ limit = 3 }: { limit?: number }) {
	const [entries, { totalSubmissions, avgScore }] = await Promise.all([
		caller.leaderboard.getLeaderboard({ limit }),
		caller.leaderboard.stats(),
	]);

	if (entries.length === 0) {
		return (
			<div className="border border-border-primary rounded-lg py-10 text-center font-mono text-sm text-text-tertiary">
				{"// no submissions yet. be the first to get roasted."}
			</div>
		);
	}

	const displayCount = Math.min(totalSubmissions, limit);

	return (
		<>
			<div className="border border-border-primary rounded-lg overflow-hidden">
				{entries.map((entry, i) => (
					<LeaderboardEntry
						key={entry.id}
						rank={i + 1}
						score={entry.score ?? 0}
						language={entry.language}
						codePreview={entry.code.split("\n")[0].slice(0, 80)}
					>
						<LeaderboardEntryContent
							code={entry.code}
							language={entry.language}
						/>
					</LeaderboardEntry>
				))}
			</div>

			<p className="text-center font-mono text-xs text-text-tertiary">
				showing top {displayCount} of {totalSubmissions.toLocaleString()} · avg
				score: {avgScore.toFixed(1)}/10
			</p>
		</>
	);
}
```

- [ ] **Step 2: Verify homepage still works (limit defaults to 3)**

Run: `npm run dev` and check homepage leaderboard preview shows 3 entries

- [ ] **Step 3: Commit**

```bash
git add src/components/leaderboard-preview.tsx
git commit -m "feat: add limit prop to LeaderboardPreview"
```

---

### Task 3: Rewrite Leaderboard Page

**Files:**
- Rewrite: `src/app/leaderboard/page.tsx`

- [ ] **Step 1: Rewrite as dynamic server component**

Replace the entire file content with:

```tsx
import { Suspense } from "react";
import { LeaderboardPreview } from "@/components/leaderboard-preview";
import { LeaderboardSkeleton } from "@/components/leaderboard-skeleton";
import { Stats } from "@/components/stats";

export default function LeaderboardPage() {
	return (
		<main className="flex flex-col items-center px-20 py-10 gap-10">
			{/* Hero */}
			<section className="w-full max-w-5xl flex flex-col gap-4">
				<h1 className="font-mono text-[28px] font-bold">
					<span className="text-accent-green text-[32px]">{">"}</span>{" "}
					shame_leaderboard
				</h1>
				<p className="font-mono text-sm text-text-secondary">
					{"// the most roasted code on the internet"}
				</p>
				<Stats />
			</section>

			{/* Entries */}
			<section className="w-full max-w-5xl">
				<Suspense fallback={<LeaderboardSkeleton />}>
					<LeaderboardPreview limit={20} />
				</Suspense>
			</section>
		</main>
	);
}
```

- [ ] **Step 2: Verify page loads with real data**

Run: `npm run dev`, navigate to `/leaderboard`. Verify:
- Page shows dynamic stats from database
- 20 entries displayed with collapsible panels
- Syntax highlighting works when expanding entries
- Score colors are correct (red < 4, amber 4-7, green > 7)

- [ ] **Step 3: Verify lint and build pass**

Run: `npm run lint` — expected: no errors
Run: `npm run build` — expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/app/leaderboard/page.tsx
git commit -m "feat: dynamic leaderboard page with 20 entries"
```
