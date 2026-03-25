import {
	CodeBlockBody,
	CodeBlockContent,
	CodeBlockLineNumbers,
} from "@/components/ui";

export interface LeaderboardEntryContentProps {
	code: string;
	language: string;
}

export async function LeaderboardEntryContent({
	code,
	language,
}: LeaderboardEntryContentProps) {
	const lineCount = code.split("\n").length;

	return (
		<div className="border-t border-border-primary bg-bg-input">
			<CodeBlockBody className="max-h-[320px]">
				<CodeBlockLineNumbers code={code} />
				<div className="flex-1 overflow-y-auto">
					<CodeBlockContent code={code} language={language} />
				</div>
			</CodeBlockBody>
			<div className="flex items-center justify-end px-4 py-2 border-t border-border-primary">
				<span className="font-mono text-[11px] text-text-tertiary">
					{lineCount} {lineCount === 1 ? "line" : "lines"}
				</span>
			</div>
		</div>
	);
}
