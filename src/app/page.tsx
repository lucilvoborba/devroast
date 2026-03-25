import Link from "next/link";
import { Suspense } from "react";
import { CodeSubmitSection } from "@/components/code-submit-section";
import { LeaderboardPreview } from "@/components/leaderboard-preview";
import { LeaderboardSkeleton } from "@/components/leaderboard-skeleton";
import { Stats } from "@/components/stats";
import { Button } from "@/components/ui";

export default function HomePage() {
	return (
		<main className="flex flex-col items-center px-10 pt-20 pb-16 gap-8">
			{/* Hero Section */}
			<section className="flex flex-col items-center gap-3 text-center">
				<h1 className="font-mono text-[36px] font-bold">
					<span className="text-accent-green">{"$"}</span> paste your code. get
					roasted.
				</h1>
				<p className="font-mono text-sm text-text-secondary">
					{
						"// drop your code below and we'll rate it — brutally honest or full roast mode"
					}
				</p>
			</section>

			{/* Code Editor + Actions */}
			<CodeSubmitSection />

			{/* Footer Stats */}
			<Stats />

			{/* Spacer */}
			<div className="h-16" />

			{/* Leaderboard Preview */}
			<section className="w-full max-w-5xl flex flex-col gap-6">
				<div className="flex items-center justify-between">
					<h2 className="font-mono text-sm text-text-primary">
						<span className="text-accent-green">{"//"}</span> shame_leaderboard
					</h2>
					<Link href="/leaderboard">
						<Button variant="outline" size="sm">
							{"$ view_all >>"}
						</Button>
					</Link>
				</div>

				<p className="font-mono text-[13px] text-text-tertiary">
					{"// the worst code on the internet, ranked by shame"}
				</p>

				{/* Table Header */}
				<div className="flex items-center gap-6 py-2.5 px-5 bg-bg-surface rounded-t-lg border border-border-primary border-b-0 font-mono text-xs text-text-tertiary">
					<span className="w-10">rank</span>
					<span className="w-[60px]">score</span>
					<span className="flex-1">code</span>
					<span className="w-[100px]">lang</span>
				</div>

				{/* Table Rows + Stats (queries em paralelo) */}
				<Suspense fallback={<LeaderboardSkeleton />}>
					<LeaderboardPreview />
				</Suspense>

				<Link
					href="/leaderboard"
					className="text-center font-mono text-xs text-text-tertiary hover:text-text-secondary transition-colors"
				>
					view full leaderboard {">>"}
				</Link>
			</section>
		</main>
	);
}
