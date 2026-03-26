import { cacheLife } from "next/cache";
import { caller } from "@/trpc/server";
import { StatsClient } from "./stats-client";

export async function Stats() {
	"use cache";
	cacheLife("hours");

	const stats = await caller.leaderboard.stats();

	return (
		<StatsClient
			totalSubmissions={stats.totalSubmissions}
			avgScore={stats.avgScore}
		/>
	);
}
