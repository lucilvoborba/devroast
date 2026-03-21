import { getStats } from "@/db/queries";
import { baseProcedure, createTRPCRouter } from "../init";

export const leaderboardRouter = createTRPCRouter({
	stats: baseProcedure.query(async () => {
		return getStats();
	}),
});
