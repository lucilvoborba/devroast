import { getLeaderboard, getStats } from "@/db/queries";
import { baseProcedure, createTRPCRouter } from "../init";

export const leaderboardRouter = createTRPCRouter({
	stats: baseProcedure.query(async () => {
		return getStats();
	}),
	getLeaderboard: baseProcedure.query(async () => {
		return getLeaderboard(3);
	}),
});
