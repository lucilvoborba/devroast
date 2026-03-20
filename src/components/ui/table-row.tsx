import { forwardRef, type HTMLAttributes } from "react";
import { tv } from "tailwind-variants";
import { cn } from "./utils";

export type TableRowRootProps = HTMLAttributes<HTMLDivElement>;

const TableRowRoot = forwardRef<HTMLDivElement, TableRowRootProps>(
	({ className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"flex items-center gap-6 py-4 px-5 border-b border-border-primary font-mono",
					className,
				)}
				{...props}
			/>
		);
	},
);

TableRowRoot.displayName = "TableRowRoot";

export type TableRowRankProps = HTMLAttributes<HTMLSpanElement>;

const TableRowRank = forwardRef<HTMLSpanElement, TableRowRankProps>(
	({ className, ...props }, ref) => {
		return (
			<span
				ref={ref}
				className={cn("w-10 text-xs text-text-tertiary", className)}
				{...props}
			/>
		);
	},
);

TableRowRank.displayName = "TableRowRank";

export interface TableRowScoreProps extends HTMLAttributes<HTMLSpanElement> {
	score: number;
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

const TableRowScore = forwardRef<HTMLSpanElement, TableRowScoreProps>(
	({ score, className, ...props }, ref) => {
		return (
			<span
				ref={ref}
				className={scoreColor({ level: getScoreLevel(score), className })}
				{...props}
			/>
		);
	},
);

TableRowScore.displayName = "TableRowScore";

export type TableRowCodeProps = HTMLAttributes<HTMLSpanElement>;

const TableRowCode = forwardRef<HTMLSpanElement, TableRowCodeProps>(
	({ className, ...props }, ref) => {
		return (
			<span
				ref={ref}
				className={cn("flex-1 text-xs text-text-secondary truncate", className)}
				{...props}
			/>
		);
	},
);

TableRowCode.displayName = "TableRowCode";

export type TableRowLanguageProps = HTMLAttributes<HTMLSpanElement>;

const TableRowLanguage = forwardRef<HTMLSpanElement, TableRowLanguageProps>(
	({ className, ...props }, ref) => {
		return (
			<span
				ref={ref}
				className={cn("w-[100px] text-xs text-text-tertiary", className)}
				{...props}
			/>
		);
	},
);

TableRowLanguage.displayName = "TableRowLanguage";

export {
	TableRowCode,
	TableRowLanguage,
	TableRowRank,
	TableRowRoot,
	TableRowScore,
};
