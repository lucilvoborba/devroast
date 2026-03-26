import OpenAI from "openai";

export interface RoastIssue {
	severity: "critical" | "warning" | "good";
	title: string;
	description: string;
	lineStart?: number;
	lineEnd?: number;
}

export interface RoastFix {
	originalCode: string;
	fixedCode: string;
	explanation: string;
}

export interface RoastAnalysis {
	score: number;
	roastMessage: string;
	issues: RoastIssue[];
	fixes: RoastFix[];
}

const SARCASTIC_SYSTEM_PROMPT = `You are DevRoast, a brutally sarcastic but technically brilliant code reviewer.
Analyze the submitted code and absolutely roast it while still providing genuinely useful feedback.
Be witty, cutting, and hilarious — but your technical analysis must be accurate.
Use memes, pop culture references, and developer humor.
Score the code from 0 (perfect) to 10 (catastrophic).

Respond with a JSON object matching this exact schema:
{
  "score": number (0-10, 0=perfect, 10=catastrophic),
  "roastMessage": string (1-2 sentences of maximum sass),
  "issues": array of { "severity": "critical"|"warning"|"good", "title": string, "description": string, "lineStart"?: number, "lineEnd"?: number },
  "fixes": array of { "originalCode": string, "fixedCode": string, "explanation": string }
}`;

const PROFESSIONAL_SYSTEM_PROMPT = `You are DevRoast, a professional and constructive code reviewer.
Analyze the submitted code and provide detailed, actionable feedback focused on best practices, security, and maintainability.
Be encouraging while being honest about issues.
Score the code from 0 (perfect) to 10 (catastrophic).

Respond with a JSON object matching this exact schema:
{
  "score": number (0-10, 0=perfect, 10=catastrophic),
  "roastMessage": string (1-2 sentences summarizing the overall assessment),
  "issues": array of { "severity": "critical"|"warning"|"good", "title": string, "description": string, "lineStart"?: number, "lineEnd"?: number },
  "fixes": array of { "originalCode": string, "fixedCode": string, "explanation": string }
}`;

const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

function validateResponse(data: unknown): data is RoastAnalysis {
	if (typeof data !== "object" || data === null) return false;
	const obj = data as Record<string, unknown>;

	if (typeof obj.score !== "number" || obj.score < 0 || obj.score > 10)
		return false;
	if (typeof obj.roastMessage !== "string" || obj.roastMessage.length === 0)
		return false;
	if (!Array.isArray(obj.issues)) return false;
	if (!Array.isArray(obj.fixes)) return false;

	for (const issue of obj.issues) {
		if (typeof issue !== "object" || issue === null) return false;
		if (!["critical", "warning", "good"].includes(issue.severity)) return false;
		if (typeof issue.title !== "string") return false;
		if (typeof issue.description !== "string") return false;
	}

	for (const fix of obj.fixes) {
		if (typeof fix !== "object" || fix === null) return false;
		if (typeof fix.originalCode !== "string") return false;
		if (typeof fix.fixedCode !== "string") return false;
		if (typeof fix.explanation !== "string") return false;
	}

	return true;
}

export async function analyzeCode(
	code: string,
	language: string,
	roastMode: boolean,
): Promise<RoastAnalysis> {
	const systemPrompt = roastMode
		? SARCASTIC_SYSTEM_PROMPT
		: PROFESSIONAL_SYSTEM_PROMPT;
	const temperature = roastMode ? 0.9 : 0.3;

	const completion = await client.chat.completions.create({
		model: "gpt-4o",
		temperature,
		max_tokens: 2000,
		response_format: { type: "json_object" },
		messages: [
			{ role: "system", content: systemPrompt },
			{
				role: "user",
				content: `Analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
			},
		],
	});

	const content = completion.choices[0]?.message?.content;
	if (!content) {
		throw new Error("OpenAI returned empty response");
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(content);
	} catch {
		throw new Error("OpenAI returned invalid JSON");
	}

	if (!validateResponse(parsed)) {
		throw new Error(
			"OpenAI response missing required fields (score, roastMessage, issues, fixes)",
		);
	}

	return parsed;
}
