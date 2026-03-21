import Link from "next/link";

export function Navbar() {
	return (
		<nav className="flex items-center justify-between h-14 px-10 border-b border-border-primary bg-bg-page">
			<Link href="/" className="flex items-center gap-2">
				<span className="text-accent-green text-xl font-bold font-mono">
					{">"}
				</span>
				<span className="text-text-primary text-lg font-medium font-mono">
					devroast
				</span>
			</Link>
			<Link
				href="/leaderboard"
				className="font-mono text-sm text-text-secondary hover:text-text-primary transition-colors"
			>
				leaderboard
			</Link>
		</nav>
	);
}
