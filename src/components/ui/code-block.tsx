import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "./utils";

export type CodeBlockRootProps = HTMLAttributes<HTMLDivElement>;

const CodeBlockRoot = forwardRef<HTMLDivElement, CodeBlockRootProps>(
	({ className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"rounded-lg border border-border-primary overflow-hidden",
					className,
				)}
				{...props}
			/>
		);
	},
);

CodeBlockRoot.displayName = "CodeBlockRoot";

export type CodeBlockHeaderProps = HTMLAttributes<HTMLDivElement>;

const CodeBlockHeader = forwardRef<HTMLDivElement, CodeBlockHeaderProps>(
	({ className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"flex items-center h-10 px-4 gap-3 border-b border-border-primary",
					className,
				)}
				{...props}
			/>
		);
	},
);

CodeBlockHeader.displayName = "CodeBlockHeader";

export type CodeBlockFileNameProps = HTMLAttributes<HTMLSpanElement>;

const CodeBlockFileName = forwardRef<HTMLSpanElement, CodeBlockFileNameProps>(
	({ className, ...props }, ref) => {
		return (
			<span
				ref={ref}
				className={cn("text-xs text-text-tertiary font-mono", className)}
				{...props}
			/>
		);
	},
);

CodeBlockFileName.displayName = "CodeBlockFileName";

export type CodeBlockBodyProps = HTMLAttributes<HTMLDivElement>;

const CodeBlockBody = forwardRef<HTMLDivElement, CodeBlockBodyProps>(
	({ className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"flex bg-bg-input border border-border-primary overflow-x-auto",
					className,
				)}
				{...props}
			/>
		);
	},
);

CodeBlockBody.displayName = "CodeBlockBody";

export interface CodeBlockLineNumbersProps
	extends HTMLAttributes<HTMLDivElement> {
	code: string;
}

const CodeBlockLineNumbers = forwardRef<
	HTMLDivElement,
	CodeBlockLineNumbersProps
>(({ code, className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			className={cn(
				"flex flex-col items-end px-3 py-3 border-r border-border-primary bg-bg-surface select-none",
				className,
			)}
			{...props}
		>
			{Array.from({ length: code.split("\n").length }, (_, i) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: static line numbers
					key={i}
					className="font-mono text-xs text-text-tertiary leading-6"
				>
					{i + 1}
				</span>
			))}
		</div>
	);
});

CodeBlockLineNumbers.displayName = "CodeBlockLineNumbers";

export interface CodeBlockContentProps extends HTMLAttributes<HTMLDivElement> {
	code: string;
	language?: string;
}

async function CodeBlockContentInner({
	code,
	language = "javascript",
	className,
	...props
}: CodeBlockContentProps) {
	const { codeToHtml } = await import("shiki");
	const highlighted = await codeToHtml(code, {
		lang: language,
		theme: "vesper",
	});

	return (
		<div
			className={cn(
				"flex-1 p-3 [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:font-mono [&>pre]:text-[13px] [&>pre]:leading-6",
				className,
			)}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output
			dangerouslySetInnerHTML={{ __html: highlighted }}
			{...props}
		/>
	);
}

const CodeBlockContent = CodeBlockContentInner;

export {
	CodeBlockBody,
	CodeBlockContent,
	CodeBlockFileName,
	CodeBlockHeader,
	CodeBlockLineNumbers,
	CodeBlockRoot,
};
