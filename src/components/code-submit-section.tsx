"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/code-editor";
import { RoastToggle } from "@/components/roast-toggle";
import { Button } from "@/components/ui";

const MAX_LENGTH = 2000;

export function CodeSubmitSection() {
	const [code, setCode] = useState("");
	const isOverLimit = code.length > MAX_LENGTH;

	return (
		<>
			{/* Code Editor */}
			<section className="w-full max-w-5xl">
				<CodeEditor code={code} onCodeChange={setCode} maxLength={MAX_LENGTH} />
			</section>

			{/* Actions Bar */}
			<section className="w-full max-w-5xl flex items-center justify-between">
				<RoastToggle />
				<Button disabled={isOverLimit || code.length === 0}>
					$ roast_my_code
				</Button>
			</section>
		</>
	);
}
