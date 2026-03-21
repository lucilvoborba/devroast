import {
	CodeBlockBody,
	CodeBlockHeader,
	CodeBlockLineNumbers,
	CodeBlockRoot,
} from "@/components/ui";

const ENTRIES = [
	{
		rank: 1,
		score: 1.2,
		language: "javascript",
		lines: [
			"eval(prompt('enter code'))",
			"document.write(response)",
			"// trust the user lol",
		],
	},
	{
		rank: 2,
		score: 2.8,
		language: "typescript",
		lines: ["function add(a: any, b: any): any {", "  return a + b;", "}"],
	},
	{
		rank: 3,
		score: 3.1,
		language: "sql",
		lines: [
			`SELECT * FROM users WHERE name = "'; DROP TABLE users; --"`,
			"DELETE FROM logs",
		],
	},
	{
		rank: 4,
		score: 4.5,
		language: "java",
		lines: [
			"public String concat(String a, String b) {",
			"  return a + b + b + a;",
			"}",
		],
	},
	{
		rank: 5,
		score: 5.7,
		language: "javascript",
		lines: [
			"var x = 0;",
			"setInterval(function() { x++ }, 1000);",
			"document.title = x;",
		],
	},
];

function ScoreColor({ score }: { score: number }) {
	if (score <= 3) return <span className="text-accent-red">{score}</span>;
	if (score <= 6) return <span className="text-accent-amber">{score}</span>;
	return <span className="text-accent-green">{score}</span>;
}

export default function LeaderboardPage() {
	return (
		<main className="flex flex-col items-center px-20 py-10 gap-10">
			{/* Hero */}
			<section className="w-full max-w-5xl flex flex-col gap-4">
				<h1 className="font-mono text-[28px] font-bold">
					<span className="text-accent-green text-[32px]">{">"}</span>{" "}
					shame_leaderboard
				</h1>
				<p className="font-mono text-sm text-text-secondary">
					{"// the most roasted code on the internet"}
				</p>
				<div className="flex items-center gap-2 font-mono text-xs text-text-tertiary">
					<span>2,847 submissions</span>
					<span>·</span>
					<span>avg score: 4.2/10</span>
				</div>
			</section>

			{/* Entries */}
			<section className="w-full max-w-5xl flex flex-col gap-5">
				{ENTRIES.map((entry) => (
					<CodeBlockRoot key={entry.rank}>
						<CodeBlockHeader>
							<div className="flex items-center gap-4">
								<span className="flex items-baseline gap-1.5 font-mono text-xs">
									<span className="text-text-tertiary">#</span>
									<span className="text-accent-amber font-bold">
										{entry.rank}
									</span>
								</span>
								<span className="flex items-baseline gap-1.5 font-mono text-xs">
									<span className="text-text-tertiary">score:</span>
									<ScoreColor score={entry.score} />
								</span>
							</div>
							<span className="flex-1" />
							<div className="flex items-center gap-3 font-mono text-xs">
								<span className="text-text-secondary">{entry.language}</span>
								<span className="text-text-tertiary">
									{entry.lines.length} lines
								</span>
							</div>
						</CodeBlockHeader>

						<CodeBlockBody className="h-[120px]">
							<CodeBlockLineNumbers code={entry.lines.join("\n")} />
							<div className="flex-1 p-3.5">
								{entry.lines.map((line, i) => (
									<span
										// biome-ignore lint/suspicious/noArrayIndexKey: static content
										key={`${entry.rank}-${i}`}
										className="block font-mono text-xs leading-6 text-text-primary whitespace-pre"
									>
										{line}
									</span>
								))}
							</div>
						</CodeBlockBody>
					</CodeBlockRoot>
				))}
			</section>
		</main>
	);
}
