import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { tv } from "tailwind-variants";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?:
		| "default"
		| "secondary"
		| "destructive"
		| "outline"
		| "ghost"
		| "link";
	size?: "sm" | "md" | "lg";
	loading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

const button = tv({
	base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-mono text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
	variants: {
		variant: {
			default: "bg-accent-green hover:bg-accent-green/90 text-black",
			secondary: "bg-secondary hover:bg-muted text-foreground",
			destructive: "bg-destructive hover:opacity-90 text-white",
			outline:
				"border border-border bg-transparent hover:bg-muted text-foreground",
			ghost: "bg-transparent hover:bg-muted text-foreground",
			link: "text-foreground underline-offset-4 hover:underline",
		},
		size: {
			sm: "h-8 px-3 text-xs",
			md: "h-10 px-4 py-2",
			lg: "h-11 px-6 py-2.5",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "md",
	},
});

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			loading,
			leftIcon,
			rightIcon,
			children,
			disabled,
			...props
		},
		ref,
	) => {
		return (
			<button
				className={button({ variant, size, className })}
				ref={ref}
				disabled={disabled || loading}
				{...props}
			>
				{loading ? <Loader2 className="animate-spin" /> : leftIcon}
				{children}
				{!loading && rightIcon}
			</button>
		);
	},
);

Button.displayName = "Button";

export { Button };
