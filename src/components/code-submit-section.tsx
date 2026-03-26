"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CodeEditor } from "@/components/code-editor";
import { RoastToggle } from "@/components/roast-toggle";
import { Button } from "@/components/ui";
import { useTRPC } from "@/trpc/client";

const MAX_LENGTH = 2000;

export function CodeSubmitSection() {
	const [code, setCode] = useState("");
	const [language, setLanguage] = useState("plaintext");
	const [roastMode, setRoastMode] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const isOverLimit = code.length > MAX_LENGTH;

	const router = useRouter();
	const trpc = useTRPC();
	const mutation = useMutation(trpc.roast.create.mutationOptions());

	const handleSubmit = () => {
		setError(null);
		mutation.mutate(
			{ code, language, roastMode },
			{
				onSuccess: (data) => {
					router.push(`/result/${data.id}`);
				},
				onError: (err) => {
					setError(err.message);
				},
			},
		);
	};

	const handleCodeChange = (newCode: string) => {
		setCode(newCode);
		if (error) setError(null);
	};

	const isDisabled = isOverLimit || code.length === 0 || mutation.isPending;

	return (
		<>
			{/* Code Editor */}
			<section className="w-full max-w-5xl">
				<CodeEditor
					code={code}
					language={language}
					onCodeChange={handleCodeChange}
					onLanguageChange={setLanguage}
					maxLength={MAX_LENGTH}
				/>
			</section>

			{/* Actions Bar */}
			<section className="w-full max-w-5xl flex items-center justify-between">
				<RoastToggle checked={roastMode} onCheckedChange={setRoastMode} />
				<Button disabled={isDisabled} onClick={handleSubmit}>
					{mutation.isPending ? "$ roasting..." : "$ roast_my_code"}
				</Button>
			</section>

			{/* Error Message */}
			{error && (
				<section className="w-full max-w-5xl">
					<p className="font-mono text-xs text-accent-red">{error}</p>
				</section>
			)}
		</>
	);
}
