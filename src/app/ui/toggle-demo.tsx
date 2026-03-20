"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui";

export function ToggleDemo() {
	const [roastMode, setRoastMode] = useState(false);
	const [autoSave, setAutoSave] = useState(true);
	const [notifications, setNotifications] = useState(false);

	return (
		<div className="flex flex-wrap gap-6">
			<Toggle
				checked={roastMode}
				onCheckedChange={setRoastMode}
				label="roast mode"
			/>
			<Toggle
				checked={autoSave}
				onCheckedChange={setAutoSave}
				label="auto_save"
			/>
			<Toggle
				checked={notifications}
				onCheckedChange={setNotifications}
				label="notifications"
				disabled
			/>
		</div>
	);
}
