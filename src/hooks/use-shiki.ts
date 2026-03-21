"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HighlighterCore } from "shiki/core";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import shikiWasm from "shiki/wasm";
import { LANGUAGES } from "@/lib/languages";

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighterCore({
			engine: createOnigurumaEngine(shikiWasm),
			themes: [
				import("shiki/themes/github-dark.mjs"),
				import("shiki/themes/github-light.mjs"),
			],
			langs: [],
		});
	}
	return highlighterPromise;
}

export function useShiki() {
	const highlighterRef = useRef<HighlighterCore | null>(null);
	const [isReady, setIsReady] = useState(false);
	const loadingLangsRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		let cancelled = false;
		getHighlighter().then((h) => {
			if (!cancelled) {
				highlighterRef.current = h;
				setIsReady(true);
			}
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const loadLanguage = useCallback(async (langId: string) => {
		const highlighter = highlighterRef.current;
		if (!highlighter) return false;

		const lang = LANGUAGES[langId];
		if (!lang) return false;

		const loaded = highlighter.getLoadedLanguages();
		if (loaded.includes(lang.shikiLang)) return true;

		if (loadingLangsRef.current.has(langId)) return false;
		loadingLangsRef.current.add(langId);

		try {
			await highlighter.loadLanguage(lang.src());
			return true;
		} catch {
			return false;
		} finally {
			loadingLangsRef.current.delete(langId);
		}
	}, []);

	const highlight = useCallback(
		async (code: string, langId: string): Promise<string> => {
			const highlighter = highlighterRef.current;
			if (!highlighter) return escapeHtml(code);

			const lang = LANGUAGES[langId];
			if (!lang || langId === "plaintext") return escapeHtml(code);

			const loaded = await loadLanguage(langId);
			if (!loaded) return escapeHtml(code);

			try {
				return highlighter.codeToHtml(code, {
					lang: lang.shikiLang,
					theme: "github-dark",
				});
			} catch {
				return escapeHtml(code);
			}
		},
		[loadLanguage],
	);

	return { highlight, isReady };
}

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
