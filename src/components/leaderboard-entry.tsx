"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

export interface LeaderboardEntryProps {
	rank: number;
	score: number;
	language: string;
	codePreview: string;
	children: ReactNode;
}

const scoreColor = tv({
	base: "w-[60px] text-[13px] font-mono font-bold",
	variants: {
		level: {
			low: "text-accent-red",
			mid: "text-accent-amber",
			high: "text-accent-green",
		},
	},
});

function getScoreLevel(score: number): "low" | "mid" | "high" {
	if (score < 4) return "low";
	if (score <= 7) return "mid";
	return "high";
}

export function LeaderboardEntry({
	rank,
	score,
	language,
	codePreview,
	children,
}: LeaderboardEntryProps) {
	return (
		<Collapsible.Root className="border-b border-border-primary last:border-b-0">
			<Collapsible.Trigger className="flex items-center gap-6 py-4 px-5 w-full text-left hover:bg-bg-surface/50 transition-colors cursor-pointer font-mono">
				<span className="w-10 text-xs text-text-tertiary">{`#${rank}`}</span>
				<span className={scoreColor({ level: getScoreLevel(score) })}>
					{score}
				</span>
				<span className="flex-1 text-xs text-text-secondary truncate">
					{codePreview}
				</span>
				<span className="w-[100px] text-xs text-text-tertiary">{language}</span>
				<ChevronDown
					size={14}
					className="text-text-tertiary transition-transform [[data-panel-open]>&]:rotate-180"
				/>
			</Collapsible.Trigger>

			<Collapsible.Panel className="overflow-hidden">
				{children}
			</Collapsible.Panel>
		</Collapsible.Root>
	);
}
