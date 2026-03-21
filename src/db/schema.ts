import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	real,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const issueSeverityEnum = pgEnum("issue_severity", [
	"critical",
	"warning",
	"good",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
	"pending",
	"analyzed",
	"failed",
]);

export const submissions = pgTable("submissions", {
	id: uuid().primaryKey().defaultRandom(),
	code: text().notNull(),
	language: varchar({ length: 50 }).notNull(),
	lineCount: integer().notNull(),
	roastMode: boolean().notNull().default(false),
	score: real(),
	roastMessage: text(),
	status: submissionStatusEnum().notNull().default("pending"),
	createdAt: timestamp().notNull().defaultNow(),
});

export const analysisIssues = pgTable("analysis_issues", {
	id: uuid().primaryKey().defaultRandom(),
	submissionId: uuid()
		.notNull()
		.references(() => submissions.id, { onDelete: "cascade" }),
	severity: issueSeverityEnum().notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text().notNull(),
	lineStart: integer(),
	lineEnd: integer(),
	position: integer().notNull().default(0),
});

export const suggestedFixes = pgTable("suggested_fixes", {
	id: uuid().primaryKey().defaultRandom(),
	submissionId: uuid()
		.notNull()
		.references(() => submissions.id, { onDelete: "cascade" }),
	originalCode: text().notNull(),
	fixedCode: text().notNull(),
	explanation: text().notNull(),
	position: integer().notNull().default(0),
});

export const leaderboardStats = pgTable("leaderboard_stats", {
	id: integer().primaryKey(),
	totalSubmissions: integer().notNull().default(0),
	avgScore: real().notNull().default(0),
	updatedAt: timestamp().notNull().defaultNow(),
});
