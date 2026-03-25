import type { Metadata } from "next";
import { Suspense } from "react";
import { LeaderboardPreview } from "@/components/leaderboard-preview";
import { LeaderboardSkeleton } from "@/components/leaderboard-skeleton";
import { Stats } from "@/components/stats";

export const metadata: Metadata = {
	title: "leaderboard — devroast",
	description: "the most roasted code on the internet, ranked by shame",
};

export default function LeaderboardPage() {
	return (
		<main className="flex flex-col items-center px-10 py-10 gap-10">
			{/* Hero */}
			<section className="w-full max-w-5xl flex flex-col gap-6">
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
