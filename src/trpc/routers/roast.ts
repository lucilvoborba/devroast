import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
	createAnalysisIssues,
	createSubmission,
	createSuggestedFixes,
	getSubmission,
	getSubmissionFixes,
	getSubmissionIssues,
	updateSubmissionAnalysis,
} from "@/db/queries";
import { analyzeCode } from "@/lib/roast-analyzer";
import { baseProcedure, createTRPCRouter } from "../init";

export const roastRouter = createTRPCRouter({
	create: baseProcedure
		.input(
			z.object({
				code: z.string().min(1).max(2000),
				language: z.string().min(1).max(50),
				roastMode: z.boolean(),
			}),
		)
		.mutation(async ({ input }) => {
			const lineCount = input.code.split("\n").length;
			const submission = await createSubmission({
				code: input.code,
				language: input.language,
				lineCount,
				roastMode: input.roastMode,
			});

			try {
				const analysis = await analyzeCode(
					input.code,
					input.language,
					input.roastMode,
				);

				await updateSubmissionAnalysis(submission.id, {
					score: analysis.score,
					roastMessage: analysis.roastMessage,
					status: "analyzed",
				});

				await createAnalysisIssues(
					submission.id,
					analysis.issues.map((issue, i) => ({
						...issue,
						position: i,
					})),
				);

				await createSuggestedFixes(
					submission.id,
					analysis.fixes.map((fix, i) => ({
						...fix,
						position: i,
					})),
				);
			} catch (error) {
				console.error("Roast analysis failed:", error);

				await updateSubmissionAnalysis(submission.id, {
					score: 0,
					roastMessage: "",
					status: "failed",
				});

				const message =
					error instanceof Error ? error.message : "Failed to analyze code";
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message,
				});
			}

			return { id: submission.id };
		}),

	getById: baseProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			const submission = await getSubmission(input.id);
			if (!submission) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Submission not found",
				});
			}

			const [issues, fixes] = await Promise.all([
				getSubmissionIssues(input.id),
				getSubmissionFixes(input.id),
			]);

			return { ...submission, issues, fixes };
		}),
});
