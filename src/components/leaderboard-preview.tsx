import { LeaderboardEntry } from "@/components/leaderboard-entry";
import { LeaderboardEntryContent } from "@/components/leaderboard-entry-content";
import { caller } from "@/trpc/server";

export async function LeaderboardPreview() {
	const [entries, { totalSubmissions, avgScore }] = await Promise.all([
		caller.leaderboard.getLeaderboard(),
		caller.leaderboard.stats(),
	]);

	if (entries.length === 0) {
		return (
			<div className="border border-border-primary rounded-lg py-10 text-center font-mono text-sm text-text-tertiary">
				{"// no submissions yet. be the first to get roasted."}
			</div>
		);
	}

	const displayCount = Math.min(totalSubmissions, 3);

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
