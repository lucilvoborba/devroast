import type { Metadata } from "next";
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

export const metadata: Metadata = {
	title: "roast result — devroast",
	description: "your code got roasted. brutally.",
};

const SAMPLE_CODE = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  return total;
}

function applyDiscount(total, code) {
  if (code == "SAVE10") {
    return total * 0.9;
  } else if (code == "FREE") {
    return 0;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`;

const ISSUES = [
	{
		severity: "critical" as const,
		title: "using var instead of const/let",
		description:
			"var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
	},
	{
		severity: "critical" as const,
		title: "imperative loop pattern",
		description:
			"for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
	},
	{
		severity: "good" as const,
		title: "clear naming conventions",
		description:
			"calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
	},
	{
		severity: "good" as const,
		title: "single responsibility",
		description:
			"the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.",
	},
];

const DIFF_LINES = [
	{ variant: "context" as const, code: "function calculateTotal(items) {" },
	{ variant: "removed" as const, code: "  var total = 0;" },
	{
		variant: "removed" as const,
		code: "  for (var i = 0; i < items.length; i++) {",
	},
	{ variant: "removed" as const, code: "    total = total + items[i].price;" },
	{ variant: "removed" as const, code: "  }" },
	{ variant: "removed" as const, code: "  return total;" },
	{
		variant: "added" as const,
		code: "  return items.reduce((sum, item) => sum + item.price, 0);",
	},
	{ variant: "context" as const, code: "}" },
];

export default function ResultPage({
	params: _params,
}: {
	params: Promise<{ id: string }>;
}) {
	return (
		<main className="flex flex-col items-center px-20 py-10 gap-10">
			{/* Score Hero */}
			<section className="w-full max-w-5xl flex items-start gap-12">
				<ScoreRing score={3.5} className="shrink-0" />

				<div className="flex flex-col gap-4 flex-1">
					<BadgeRoot variant="critical">
						<BadgeDot />
						<BadgeLabel>verdict: needs_serious_help</BadgeLabel>
					</BadgeRoot>

					<p className="font-mono text-xl text-text-primary leading-relaxed">
						&quot;this code looks like it was written during a power outage...
						in 2005.&quot;
					</p>

					<div className="flex items-center gap-4 font-mono text-xs text-text-tertiary">
						<span>lang: javascript</span>
						<span>·</span>
						<span>16 lines</span>
					</div>

					<div>
						<button
							type="button"
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
							calculateTotal.js
						</span>
					</CodeBlockHeader>
					<CodeBlockBody className="max-h-[424px] overflow-auto">
						<CodeBlockLineNumbers code={SAMPLE_CODE} />
						<div className="flex-1 p-4">
							{SAMPLE_CODE.split("\n").map((line, i) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: static code lines
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
					{ISSUES.map((issue) => (
						<div
							key={issue.title}
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

				<div className="border border-border-primary rounded-lg overflow-hidden bg-bg-input">
					<CodeBlockHeader>
						<span className="font-mono text-xs text-text-secondary">
							your_code.js → improved_code.js
						</span>
					</CodeBlockHeader>
					<div className="py-1">
						{DIFF_LINES.map((line, i) => (
							<DiffLine
								// biome-ignore lint/suspicious/noArrayIndexKey: static diff lines
								key={`diff-${i}`}
								variant={line.variant}
								code={line.code}
							/>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
