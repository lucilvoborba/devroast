export function LeaderboardSkeleton() {
	return (
		<div className="border border-border-primary rounded-b-lg overflow-hidden">
			{Array.from({ length: 3 }, (_, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
					key={i}
					className="flex items-center gap-6 py-4 px-5 border-b border-border-primary last:border-b-0"
				>
					<span className="w-10 h-4 rounded bg-bg-surface animate-pulse" />
					<span className="w-[60px] h-4 rounded bg-bg-surface animate-pulse" />
					<span className="flex-1 h-4 rounded bg-bg-surface animate-pulse" />
					<span className="w-[100px] h-4 rounded bg-bg-surface animate-pulse" />
				</div>
			))}
		</div>
	);
}
