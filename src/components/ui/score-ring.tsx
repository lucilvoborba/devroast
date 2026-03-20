import { forwardRef, type HTMLAttributes } from "react";

export interface ScoreRingProps extends HTMLAttributes<HTMLDivElement> {
	score: number;
	maxScore?: number;
}

const RADIUS = 86;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SVG_SIZE = 180;
const CENTER = SVG_SIZE / 2;
const STROKE_WIDTH = 4;

const ScoreRing = forwardRef<HTMLDivElement, ScoreRingProps>(
	({ score, maxScore = 10, className, ...props }, ref) => {
		const progress = Math.min(score / maxScore, 1);
		const offset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

		return (
			<div
				ref={ref}
				className={`relative w-[180px] h-[180px] ${className || ""}`}
				{...props}
			>
				<svg
					width={SVG_SIZE}
					height={SVG_SIZE}
					viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
					className="absolute inset-0 -rotate-90"
					aria-label={`Score: ${score} out of ${maxScore}`}
					role="img"
				>
					<defs>
						<linearGradient id="score-gradient" gradientTransform="rotate(90)">
							<stop offset="0%" stopColor="#10B981" />
							<stop offset="78%" stopColor="#10B981" />
							<stop offset="82%" stopColor="#F59E0B" />
							<stop offset="100%" stopColor="transparent" />
						</linearGradient>
					</defs>
					<circle
						cx={CENTER}
						cy={CENTER}
						r={RADIUS}
						fill="none"
						stroke="#1F1F1F"
						strokeWidth={STROKE_WIDTH}
					/>
					<circle
						cx={CENTER}
						cy={CENTER}
						r={RADIUS}
						fill="none"
						stroke="url(#score-gradient)"
						strokeWidth={STROKE_WIDTH}
						strokeLinecap="round"
						strokeDasharray={CIRCUMFERENCE}
						strokeDashoffset={offset}
						className="transition-all duration-500"
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
					<span className="font-mono text-[48px] font-bold text-text-primary leading-none">
						{score}
					</span>
					<span className="font-mono text-[16px] text-text-tertiary leading-none">
						/{maxScore}
					</span>
				</div>
			</div>
		);
	},
);

ScoreRing.displayName = "ScoreRing";

export { ScoreRing };
