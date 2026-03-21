import { caller } from "@/trpc/server";
import { StatsClient } from "./stats-client";

export async function Stats() {
	const stats = await caller.leaderboard.stats();

	return (
		<StatsClient
			totalSubmissions={stats.totalSubmissions}
			avgScore={stats.avgScore}
		/>
	);
}
