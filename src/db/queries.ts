import { asc, avg, count, eq } from "drizzle-orm";
import { db } from "./index";
import {
	analysisIssues,
	leaderboardStats,
	type submissionStatusEnum,
	submissions,
	suggestedFixes,
} from "./schema";

type SubmissionStatus = (typeof submissionStatusEnum.enumValues)[number];

export async function createSubmission(data: {
	code: string;
	language: string;
	lineCount: number;
	roastMode: boolean;
}) {
	const [row] = await db
		.insert(submissions)
		.values(data)
		.returning({ id: submissions.id });

	return row;
}

export async function getSubmission(id: string) {
	const [row] = await db
		.select()
		.from(submissions)
		.where(eq(submissions.id, id))
		.limit(1);

	return row ?? null;
}

export async function updateSubmissionAnalysis(
	id: string,
	data: {
		score: number;
		roastMessage: string;
		status: SubmissionStatus;
	},
) {
	await db.update(submissions).set(data).where(eq(submissions.id, id));
}

export async function createAnalysisIssues(
	submissionId: string,
	issues: Array<{
		severity: "critical" | "warning" | "good";
		title: string;
		description: string;
		lineStart?: number;
		lineEnd?: number;
		position: number;
	}>,
) {
	if (issues.length === 0) return;
	await db
		.insert(analysisIssues)
		.values(issues.map((issue) => ({ ...issue, submissionId })));
}

export async function createSuggestedFixes(
	submissionId: string,
	fixes: Array<{
		originalCode: string;
		fixedCode: string;
		explanation: string;
		position: number;
	}>,
) {
	if (fixes.length === 0) return;
	await db
		.insert(suggestedFixes)
		.values(fixes.map((fix) => ({ ...fix, submissionId })));
}

export async function getSubmissionIssues(submissionId: string) {
	return db
		.select()
		.from(analysisIssues)
		.where(eq(analysisIssues.submissionId, submissionId))
		.orderBy(asc(analysisIssues.position));
}

export async function getSubmissionFixes(submissionId: string) {
	return db
		.select()
		.from(suggestedFixes)
		.where(eq(suggestedFixes.submissionId, submissionId))
		.orderBy(asc(suggestedFixes.position));
}

export async function getLeaderboard(limit = 10) {
	return db
		.select({
			id: submissions.id,
			score: submissions.score,
			language: submissions.language,
			lineCount: submissions.lineCount,
			code: submissions.code,
			createdAt: submissions.createdAt,
		})
		.from(submissions)
		.where(eq(submissions.status, "analyzed"))
		.orderBy(asc(submissions.score))
		.limit(limit);
}

export async function getStats() {
	const [row] = await db
		.select({
			total: count(),
			avgScore: avg(submissions.score),
		})
		.from(submissions)
		.where(eq(submissions.status, "analyzed"));

	return {
		totalSubmissions: Number(row?.total ?? 0),
		avgScore: Number(row?.avgScore ?? 0),
	};
}

export async function upsertLeaderboardStats() {
	const stats = await getStats();

	await db
		.insert(leaderboardStats)
		.values({
			id: 1,
			totalSubmissions: stats.totalSubmissions,
			avgScore: stats.avgScore,
		})
		.onConflictDoUpdate({
			target: leaderboardStats.id,
			set: {
				totalSubmissions: stats.totalSubmissions,
				avgScore: stats.avgScore,
			},
		});
}
