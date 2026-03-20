import { forwardRef, type HTMLAttributes } from "react";
import { tv } from "tailwind-variants";

export interface BadgeRootProps extends HTMLAttributes<HTMLDivElement> {
	variant: "critical" | "warning" | "good";
}

const badgeRoot = tv({
	base: "inline-flex items-center gap-2 [&>*]:text-inherit",
	variants: {
		variant: {
			critical: "text-accent-red [&>span:first-child]:bg-accent-red",
			warning: "text-accent-amber [&>span:first-child]:bg-accent-amber",
			good: "text-accent-green [&>span:first-child]:bg-accent-green",
		},
	},
});

const BadgeRoot = forwardRef<HTMLDivElement, BadgeRootProps>(
	({ variant, className, ...props }, ref) => {
		return (
			<div ref={ref} className={badgeRoot({ variant, className })} {...props} />
		);
	},
);

BadgeRoot.displayName = "BadgeRoot";

export type BadgeDotProps = HTMLAttributes<HTMLSpanElement>;

const BadgeDot = forwardRef<HTMLSpanElement, BadgeDotProps>(
	({ className, ...props }, ref) => {
		return (
			<span
				ref={ref}
				className={`w-2 h-2 rounded-full ${className || ""}`}
				{...props}
			/>
		);
	},
);

BadgeDot.displayName = "BadgeDot";

export type BadgeLabelProps = HTMLAttributes<HTMLSpanElement>;

const BadgeLabel = forwardRef<HTMLSpanElement, BadgeLabelProps>(
	({ className, ...props }, ref) => {
		return (
			<span
				ref={ref}
				className={`font-mono text-xs ${className || ""}`}
				{...props}
			/>
		);
	},
);

BadgeLabel.displayName = "BadgeLabel";

export { BadgeDot, BadgeLabel, BadgeRoot };
