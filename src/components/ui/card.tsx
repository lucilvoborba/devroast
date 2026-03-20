import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "./utils";

export type CardRootProps = HTMLAttributes<HTMLDivElement>;

const CardRoot = forwardRef<HTMLDivElement, CardRootProps>(
	({ className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"flex flex-col gap-3 p-5 border border-border-primary rounded-lg",
					className,
				)}
				{...props}
			/>
		);
	},
);

CardRoot.displayName = "CardRoot";

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
	({ className, ...props }, ref) => {
		return <div ref={ref} className={cn("", className)} {...props} />;
	},
);

CardHeader.displayName = "CardHeader";

export type CardBodyProps = HTMLAttributes<HTMLDivElement>;

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
	({ className, ...props }, ref) => {
		return <div ref={ref} className={cn("", className)} {...props} />;
	},
);

CardBody.displayName = "CardBody";

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
	({ className, ...props }, ref) => {
		return <div ref={ref} className={cn("", className)} {...props} />;
	},
);

CardFooter.displayName = "CardFooter";

export { CardBody, CardFooter, CardHeader, CardRoot };
