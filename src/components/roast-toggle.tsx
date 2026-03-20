"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui";

export function RoastToggle() {
	const [roastMode, setRoastMode] = useState(true);

	return (
		<div className="flex items-center gap-4">
			<Toggle
				checked={roastMode}
				onCheckedChange={setRoastMode}
				label="roast mode"
			/>
			<span className="font-mono text-xs text-text-tertiary">
				{"// maximum sarcasm enabled"}
			</span>
		</div>
	);
}
