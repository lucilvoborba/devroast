"use client";

import NumberFlow from "@number-flow/react";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const getServerSnapshot = () => false;
const getClientSnapshot = () => true;

interface StatsClientProps {
	totalSubmissions: number;
	avgScore: number;
}

export function StatsClient({ totalSubmissions, avgScore }: StatsClientProps) {
	const isHydrated = useSyncExternalStore(
		emptySubscribe,
		getClientSnapshot,
		getServerSnapshot,
	);

	return (
		<p className="font-mono text-xs text-text-tertiary">
			<NumberFlow
				value={isHydrated ? totalSubmissions : 0}
				format={{ useGrouping: true }}
			/>{" "}
			codes roasted · avg score:{" "}
			<NumberFlow
				value={isHydrated ? avgScore : 0}
				format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
			/>
			/10
		</p>
	);
}
