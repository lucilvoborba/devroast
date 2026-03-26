"use client";

import { Toggle } from "@/components/ui";

interface RoastToggleProps {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}

export function RoastToggle({ checked, onCheckedChange }: RoastToggleProps) {
	return (
		<div className="flex items-center gap-4">
			<Toggle
				checked={checked}
				onCheckedChange={onCheckedChange}
				label="roast mode"
			/>
			<span className="font-mono text-xs text-text-tertiary">
				{"// maximum sarcasm enabled"}
			</span>
		</div>
	);
}
