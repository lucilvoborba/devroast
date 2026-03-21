"use client";

import hljs from "highlight.js";
import { useCallback } from "react";
import { HLJS_LANG_MAP } from "@/lib/languages";

const MIN_RELEVANCE = 5;

export function useLanguageDetect() {
	const detect = useCallback((code: string): string => {
		if (!code || code.trim().length === 0) return "plaintext";

		const result = hljs.highlightAuto(code, Object.keys(HLJS_LANG_MAP));

		if (result.language && result.relevance >= MIN_RELEVANCE) {
			return HLJS_LANG_MAP[result.language] ?? result.language;
		}

		return "plaintext";
	}, []);

	return { detect };
}
