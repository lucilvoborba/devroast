"use client";

import { Switch } from "@base-ui/react/switch";
import { forwardRef, type HTMLAttributes } from "react";
import { tv } from "tailwind-variants";
import { cn } from "./utils";

export interface ToggleProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	label: string;
	disabled?: boolean;
}

const track = tv({
	base: "relative w-10 h-[22px] rounded-full p-[3px] transition-colors cursor-pointer",
	variants: {
		checked: {
			true: "bg-accent-green",
			false: "bg-border-primary",
		},
		disabled: {
			true: "opacity-50 cursor-not-allowed",
		},
	},
});

const thumb = tv({
	base: "block w-4 h-4 rounded-full bg-white transition-transform duration-150",
	variants: {
		checked: {
			true: "translate-x-[18px]",
			false: "translate-x-0",
		},
	},
});

const labelTv = tv({
	base: "font-mono text-xs transition-colors",
	variants: {
		checked: {
			true: "text-accent-green",
			false: "text-text-secondary",
		},
	},
});

const Toggle = forwardRef<HTMLDivElement, ToggleProps>(
	(
		{
			checked,
			onCheckedChange,
			label: labelText,
			disabled,
			className,
			...props
		},
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn("flex items-center gap-3", className)}
				{...props}
			>
				<Switch.Root
					checked={checked}
					onCheckedChange={onCheckedChange}
					disabled={disabled}
					className={track({ checked, disabled })}
				>
					<Switch.Thumb className={thumb({ checked })} />
				</Switch.Root>
				<span className={labelTv({ checked })}>{labelText}</span>
			</div>
		);
	},
);

Toggle.displayName = "Toggle";

export { Toggle };
