import { LeaderboardSkeleton } from "@/components/leaderboard-skeleton";

export default function LeaderboardLoading() {
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
				<span className="w-[280px] h-4 rounded bg-bg-surface animate-pulse" />
			</section>

			{/* Entries */}
			<section className="w-full max-w-5xl">
				<LeaderboardSkeleton />
			</section>
		</main>
	);
}
