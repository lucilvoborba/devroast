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
