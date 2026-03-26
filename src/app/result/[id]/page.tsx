import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	BadgeDot,
	BadgeLabel,
	BadgeRoot,
	CodeBlockBody,
	CodeBlockHeader,
	CodeBlockLineNumbers,
	CodeBlockRoot,
	DiffLine,
	ScoreRing,
} from "@/components/ui";
import { caller } from "@/trpc/server";

export const metadata: Metadata = {
	title: "roast result — devroast",
	description: "your code got roasted. brutally.",
};

const LANG_EXTENSIONS: Record<string, string> = {
	javascript: "js",
	typescript: "ts",
	tsx: "tsx",
	jsx: "jsx",
	python: "py",
	go: "go",
	rust: "rs",
	java: "java",
	c: "c",
	cpp: "cpp",
	csharp: "cs",
	ruby: "rb",
	php: "php",
	swift: "swift",
	kotlin: "kt",
	dart: "dart",
	sql: "sql",
	html: "html",
	css: "css",
	json: "json",
	yaml: "yml",
	bash: "sh",
	dockerfile: "Dockerfile",
	plaintext: "txt",
};

function getVerdict(score: number) {
	if (score <= 2)
		return { label: "verdict: clean_code", variant: "good" as const };
	if (score <= 5)
		return { label: "verdict: needs_work", variant: "warning" as const };
	if (score <= 7)
		return {
			label: "verdict: needs_serious_help",
			variant: "critical" as const,
		};
	return { label: "verdict: catastrophe", variant: "critical" as const };
}

function getFileName(language: string) {
	const ext = LANG_EXTENSIONS[language.toLowerCase()] ?? "txt";
	return `submission.${ext}`;
}

function generateDiffLines(originalCode: string, fixedCode: string) {
	const originalLines = originalCode.split("\n");
	const fixedLines = fixedCode.split("\n");
	return [
		...originalLines.map((line) => ({
			variant: "removed" as const,
			code: line,
		})),
		...fixedLines.map((line) => ({ variant: "added" as const, code: line })),
	];
}

export default async function ResultPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const data = await caller.roast.getById({ id }).catch(() => null);
	if (!data || data.status !== "analyzed") {
		notFound();
	}

	const score = data.score ?? 0;
	const verdict = getVerdict(score);
	const fileName = getFileName(data.language);

	return (
		<main className="flex flex-col items-center px-20 py-10 gap-10">
			{/* Score Hero */}
			<section className="w-full max-w-5xl flex items-start gap-12">
				<ScoreRing score={10 - score} className="shrink-0" />

				<div className="flex flex-col gap-4 flex-1">
					<BadgeRoot variant={verdict.variant}>
						<BadgeDot />
						<BadgeLabel>{verdict.label}</BadgeLabel>
					</BadgeRoot>

					<p className="font-mono text-xl text-text-primary leading-relaxed">
						&quot;{data.roastMessage}&quot;
					</p>

					<div className="flex items-center gap-4 font-mono text-xs text-text-tertiary">
						<span>lang: {data.language}</span>
						<span>·</span>
						<span>{data.lineCount} lines</span>
					</div>

					<div>
						<button
							type="button"
							disabled
							className="px-4 py-2 border border-border-primary rounded font-mono text-xs text-text-primary hover:bg-bg-surface transition-colors"
						>
							$ share_roast
						</button>
					</div>
				</div>
			</section>

			{/* Divider */}
			<div className="w-full max-w-5xl h-px bg-border-primary" />

			{/* Your Submission */}
			<section className="w-full max-w-5xl flex flex-col gap-4">
				<h2 className="font-mono text-sm font-bold">
					<span className="text-accent-green">{"//"}</span> your_submission
				</h2>

				<CodeBlockRoot>
					<CodeBlockHeader>
						<div className="flex gap-2">
							<span className="w-2.5 h-2.5 rounded-full bg-accent-red" />
							<span className="w-2.5 h-2.5 rounded-full bg-accent-amber" />
							<span className="w-2.5 h-2.5 rounded-full bg-accent-green" />
						</div>
						<span className="flex-1" />
						<span className="font-mono text-xs text-text-tertiary">
							{fileName}
						</span>
					</CodeBlockHeader>
					<CodeBlockBody className="max-h-[424px] overflow-auto">
						<CodeBlockLineNumbers code={data.code} />
						<div className="flex-1 p-4">
							{data.code.split("\n").map((line, i) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: dynamic code lines
									key={`code-${i}`}
									className="block font-mono text-xs leading-7 text-text-primary whitespace-pre"
								>
									{line}
								</span>
							))}
						</div>
					</CodeBlockBody>
				</CodeBlockRoot>
			</section>

			{/* Divider */}
			<div className="w-full max-w-5xl h-px bg-border-primary" />

			{/* Detailed Analysis */}
			<section className="w-full max-w-5xl flex flex-col gap-6">
				<h2 className="font-mono text-sm font-bold">
					<span className="text-accent-green">{"//"}</span> detailed_analysis
				</h2>

				<div className="grid grid-cols-2 gap-5">
					{data.issues.map((issue) => (
						<div
							key={issue.id}
							className="flex flex-col gap-3 p-5 border border-border-primary rounded-lg"
						>
							<BadgeRoot variant={issue.severity}>
								<BadgeDot />
								<BadgeLabel>{issue.severity}</BadgeLabel>
							</BadgeRoot>
							<h3 className="font-mono text-sm font-medium text-text-primary">
								{issue.title}
							</h3>
							<p className="font-mono text-xs text-text-secondary leading-relaxed">
								{issue.description}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* Divider */}
			<div className="w-full max-w-5xl h-px bg-border-primary" />

			{/* Suggested Fix */}
			<section className="w-full max-w-5xl flex flex-col gap-6">
				<h2 className="font-mono text-sm font-bold">
					<span className="text-accent-green">{"//"}</span> suggested_fix
				</h2>

				{data.fixes.map((fix) => {
					const diffLines = generateDiffLines(fix.originalCode, fix.fixedCode);
					return (
						<div
							key={fix.id}
							className="border border-border-primary rounded-lg overflow-hidden bg-bg-input"
						>
							<CodeBlockHeader>
								<span className="font-mono text-xs text-text-secondary">
									{fileName} → improved.{fileName.split(".").pop()}
								</span>
							</CodeBlockHeader>
							<div className="py-1">
								{diffLines.map((line, i) => (
									<DiffLine
										// biome-ignore lint/suspicious/noArrayIndexKey: dynamic diff lines
										key={`diff-${fix.id}-${i}`}
										variant={line.variant}
										code={line.code}
									/>
								))}
							</div>
						</div>
					);
				})}
			</section>
		</main>
	);
}
