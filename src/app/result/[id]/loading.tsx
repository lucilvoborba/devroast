export default function ResultLoading() {
	return (
		<main className="flex flex-col items-center px-20 py-10 gap-10">
			{/* Score Hero */}
			<section className="w-full max-w-5xl flex items-start gap-12">
				<span className="w-[120px] h-[120px] rounded-full bg-bg-surface animate-pulse shrink-0" />

				<div className="flex flex-col gap-4 flex-1">
					<span className="w-[200px] h-6 rounded bg-bg-surface animate-pulse" />
					<span className="w-full h-5 rounded bg-bg-surface animate-pulse" />
					<span className="w-[180px] h-4 rounded bg-bg-surface animate-pulse" />
				</div>
			</section>

			{/* Divider */}
			<div className="w-full max-w-5xl h-px bg-border-primary" />

			{/* Code Block Skeleton */}
			<section className="w-full max-w-5xl flex flex-col gap-4">
				<span className="w-[160px] h-4 rounded bg-bg-surface animate-pulse" />
				<div className="border border-border-primary rounded-lg overflow-hidden">
					<div className="h-10 border-b border-border-primary bg-bg-surface" />
					<div className="p-4 flex flex-col gap-3">
						{Array.from({ length: 6 }, (_, i) => (
							<span
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
								key={i}
								className="h-4 rounded bg-bg-surface animate-pulse"
								style={{ width: `${60 + (i % 3) * 12}%` }}
							/>
						))}
					</div>
				</div>
			</section>

			{/* Divider */}
			<div className="w-full max-w-5xl h-px bg-border-primary" />

			{/* Issues Skeleton */}
			<section className="w-full max-w-5xl flex flex-col gap-6">
				<span className="w-[160px] h-4 rounded bg-bg-surface animate-pulse" />
				<div className="grid grid-cols-2 gap-5">
					{Array.from({ length: 4 }, (_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
							key={i}
							className="flex flex-col gap-3 p-5 border border-border-primary rounded-lg"
						>
							<span className="w-[80px] h-5 rounded bg-bg-surface animate-pulse" />
							<span className="w-full h-4 rounded bg-bg-surface animate-pulse" />
							<span className="w-[80%] h-4 rounded bg-bg-surface animate-pulse" />
						</div>
					))}
				</div>
			</section>
		</main>
	);
}
