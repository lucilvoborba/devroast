import { forwardRef, type HTMLAttributes } from "react";
import { tv } from "tailwind-variants";

export interface DiffLineProps extends HTMLAttributes<HTMLDivElement> {
	variant: "removed" | "added" | "context";
	code: string;
}

const diffLine = tv({
	base: "flex gap-2 px-4 py-2 font-mono text-[13px]",
	variants: {
		variant: {
			removed: "bg-accent-red/5",
			added: "bg-accent-green/5",
			context: "",
		},
	},
});

const prefix = tv({
	base: "select-none",
	variants: {
		variant: {
			removed: "text-accent-red",
			added: "text-accent-green",
			context: "text-text-tertiary",
		},
	},
});

const codeText = tv({
	base: "",
	variants: {
		variant: {
			removed: "text-text-secondary",
			added: "text-text-primary",
			context: "text-text-secondary",
		},
	},
});

const prefixMap = {
	removed: "-",
	added: "+",
	context: " ",
};

const DiffLine = forwardRef<HTMLDivElement, DiffLineProps>(
	({ variant, code, className, ...props }, ref) => {
		return (
			<div ref={ref} className={diffLine({ variant, className })} {...props}>
				<span className={prefix({ variant })}>{prefixMap[variant]}</span>
				<span className={codeText({ variant })}>{code}</span>
			</div>
		);
	},
);

DiffLine.displayName = "DiffLine";

export { DiffLine };
