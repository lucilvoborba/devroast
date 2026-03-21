"use client";

import { ChevronDown } from "lucide-react";
import {
	type ChangeEventHandler,
	type ClipboardEventHandler,
	forwardRef,
	type KeyboardEventHandler,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { cn } from "@/components/ui/utils";
import { useLanguageDetect } from "@/hooks/use-language-detect";
import { escapeHtml, useShiki } from "@/hooks/use-shiki";
import { LANGUAGE_LIST, LANGUAGES } from "@/lib/languages";

export interface CodeEditorProps {
	code?: string;
	language?: string;
	onCodeChange?: (code: string) => void;
	onLanguageChange?: (lang: string) => void;
	maxLength?: number;
	showLanguageSelector?: boolean;
	showLineNumbers?: boolean;
	placeholder?: string;
	className?: string;
	height?: string;
}

const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(
	(
		{
			code: controlledCode,
			language: controlledLanguage,
			onCodeChange,
			onLanguageChange,
			maxLength = 2000,
			showLanguageSelector = true,
			showLineNumbers = true,
			placeholder = "paste your code here...",
			className,
			height = "320px",
		},
		ref,
	) => {
		const editorId = useId();
		const [internalCode, setInternalCode] = useState("");
		const [internalLanguage, setInternalLanguage] = useState("plaintext");
		const [highlightedHtml, setHighlightedHtml] = useState("");
		const [isLangOpen, setIsLangOpen] = useState(false);

		const textareaRef = useRef<HTMLTextAreaElement>(null);
		const overlayRef = useRef<HTMLDivElement>(null);
		const lineNumbersRef = useRef<HTMLDivElement>(null);
		const langDropdownRef = useRef<HTMLDivElement>(null);

		const { highlight, isReady } = useShiki();
		const { detect } = useLanguageDetect();

		const code = controlledCode ?? internalCode;
		const language = controlledLanguage ?? internalLanguage;

		const setCode = useCallback(
			(newCode: string) => {
				if (controlledCode === undefined) {
					setInternalCode(newCode);
				}
				onCodeChange?.(newCode);
			},
			[controlledCode, onCodeChange],
		);

		const setLang = useCallback(
			(newLang: string) => {
				if (controlledLanguage === undefined) {
					setInternalLanguage(newLang);
				}
				onLanguageChange?.(newLang);
			},
			[controlledLanguage, onLanguageChange],
		);

		// Show plaintext immediately, then replace with highlighted HTML
		useEffect(() => {
			if (!code || !isReady) return;

			highlight(code, language).then(setHighlightedHtml);
		}, [code, language, highlight, isReady]);

		// Sync scroll between textarea and overlay
		const handleScroll = useCallback(() => {
			const textarea = textareaRef.current;
			const overlay = overlayRef.current;
			const lineNumbers = lineNumbersRef.current;

			if (textarea && overlay) {
				overlay.scrollTop = textarea.scrollTop;
				overlay.scrollLeft = textarea.scrollLeft;
			}
			if (textarea && lineNumbers) {
				lineNumbers.scrollTop = textarea.scrollTop;
			}
		}, []);

		// Handle paste — auto-detect language, truncate if over limit
		const handlePaste = useCallback<ClipboardEventHandler<HTMLTextAreaElement>>(
			(e) => {
				if (controlledLanguage !== undefined) return;

				const pastedText = e.clipboardData.getData("text/plain");
				if (!pastedText) return;

				// Only auto-detect if current language is plaintext
				if (language === "plaintext") {
					const detected = detect(pastedText);
					if (detected !== "plaintext") {
						setLang(detected);
					}
				}
			},
			[language, detect, setLang, controlledLanguage],
		);

		// Handle code change with maxLength enforcement
		const handleChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>(
			(e) => {
				const newCode = e.target.value;
				if (newCode.length > maxLength) {
					setCode(newCode.slice(0, maxLength));
					return;
				}
				setCode(newCode);
			},
			[setCode, maxLength],
		);

		// Tab indent, auto-close brackets, enter with indent
		const handleKeyDown = useCallback<
			KeyboardEventHandler<HTMLTextAreaElement>
		>((e) => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			const { selectionStart, selectionEnd, value } = textarea;

			if (e.key === "Tab") {
				e.preventDefault();
				if (e.shiftKey) {
					// Dedent
					const before = value.slice(0, selectionStart);
					const lineStart = before.lastIndexOf("\n") + 1;
					const lineText = value.slice(lineStart, selectionEnd);
					const dedented = lineText.replace(/^ {2}/gm, "");
					const diff = lineText.length - dedented.length;

					textarea.setSelectionRange(lineStart, selectionEnd);
					document.execCommand("insertText", false, dedented);
					textarea.setSelectionRange(
						Math.max(lineStart, selectionStart - Math.min(2, diff)),
						Math.max(lineStart, selectionEnd - diff),
					);
				} else {
					document.execCommand("insertText", false, "  ");
				}
				return;
			}

			if (e.key === "Enter") {
				e.preventDefault();
				const before = value.slice(0, selectionStart);
				const currentLine = before.slice(before.lastIndexOf("\n") + 1);
				const indentMatch = currentLine.match(/^(\s+)/);
				const indent = indentMatch ? indentMatch[1] : "";
				const extraIndent = /[{([]$/.test(currentLine.trimEnd()) ? "  " : "";
				document.execCommand("insertText", false, `\n${indent}${extraIndent}`);
				return;
			}

			// Auto-close brackets
			const bracketPairs: Record<string, string> = {
				"(": ")",
				"[": "]",
				"{": "}",
				'"': '"',
				"'": "'",
				"`": "`",
			};

			if (bracketPairs[e.key]) {
				const selected = value.slice(selectionStart, selectionEnd);
				if (selected.length > 0) {
					e.preventDefault();
					const wrapped = e.key + selected + bracketPairs[e.key];
					document.execCommand("insertText", false, wrapped);
					textarea.setSelectionRange(
						selectionStart + 1,
						selectionStart + 1 + selected.length,
					);
				}
				return;
			}

			// Skip closing bracket if next char matches
			if (
				[")", "]", "}", '"', "'", "`"].includes(e.key) &&
				value[selectionStart] === e.key
			) {
				e.preventDefault();
				textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
				return;
			}

			// Escape to blur
			if (e.key === "Escape") {
				textarea.blur();
			}
		}, []);

		// Close dropdown on outside click
		useEffect(() => {
			if (!isLangOpen) return;
			const handler = (e: MouseEvent) => {
				if (
					langDropdownRef.current &&
					!langDropdownRef.current.contains(e.target as Node)
				) {
					setIsLangOpen(false);
				}
			};
			document.addEventListener("mousedown", handler);
			return () => document.removeEventListener("mousedown", handler);
		}, [isLangOpen]);

		const lineCount = code ? code.split("\n").length : 0;
		const charCount = code.length;
		const isOverLimit = charCount > maxLength;
		const currentLang = LANGUAGES[language];
		const lineNumbers = useMemo(
			() => Array.from({ length: lineCount }, (_, i) => i + 1),
			[lineCount],
		);

		// Show highlighted HTML if ready, otherwise show escaped plaintext immediately
		const displayedHtml = highlightedHtml
			? highlightedHtml
			: code
				? `<pre style="margin:0;padding:0;background:transparent"><code style="color:#E5E5E5">${escapeHtml(code)}</code></pre>`
				: "";

		return (
			<div
				ref={ref}
				className={cn(
					"flex flex-col rounded-lg border border-border-primary overflow-hidden bg-bg-input",
					className,
				)}
			>
				{/* Window header */}
				<div className="flex items-center h-10 px-4 border-b border-border-primary gap-3">
					<div className="flex gap-2">
						<span className="w-3 h-3 rounded-full bg-accent-red" />
						<span className="w-3 h-3 rounded-full bg-accent-amber" />
						<span className="w-3 h-3 rounded-full bg-accent-green" />
					</div>

					{showLanguageSelector && (
						<div ref={langDropdownRef} className="relative ml-auto">
							<button
								type="button"
								onClick={() => setIsLangOpen(!isLangOpen)}
								className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
							>
								{currentLang?.name ?? "Plaintext"}
								<ChevronDown
									size={14}
									className={cn(
										"transition-transform",
										isLangOpen && "rotate-180",
									)}
								/>
							</button>

							{isLangOpen && (
								<div className="absolute right-0 top-full mt-1 z-50 w-44 max-h-64 overflow-y-auto rounded-lg border border-border-primary bg-bg-surface shadow-lg py-1">
									{LANGUAGE_LIST.map((lang) => (
										<button
											key={lang.id}
											type="button"
											onClick={() => {
												setLang(lang.id);
												setIsLangOpen(false);
											}}
											className={cn(
												"w-full text-left px-3 py-1.5 text-xs font-mono transition-colors",
												language === lang.id
													? "text-accent-green bg-bg-elevated"
													: "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
											)}
										>
											{lang.name}
										</button>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Editor body */}
				<div className="relative" style={{ height }}>
					{/* Line numbers */}
					{showLineNumbers && lineCount > 0 && (
						<div
							ref={lineNumbersRef}
							className={cn(
								"absolute left-0 top-0 bottom-0 w-12 overflow-hidden",
								"flex flex-col items-end pr-3 pt-4",
								"bg-bg-surface border-r border-border-primary",
								"select-none pointer-events-none",
							)}
						>
							{lineNumbers.map((num) => (
								<span
									key={`${editorId}-line-${num}`}
									className="font-mono text-[13px] leading-6 text-text-tertiary"
								>
									{num}
								</span>
							))}
						</div>
					)}

					{/* Highlighted code overlay */}
					<div
						ref={overlayRef}
						className={cn(
							"absolute inset-0 overflow-hidden pointer-events-none",
							"font-mono text-[13px] leading-6 p-4",
							showLineNumbers && "pl-14",
						)}
						aria-hidden="true"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output
						dangerouslySetInnerHTML={{
							__html: displayedHtml,
						}}
						style={{
							tabSize: 2,
						}}
					/>

					{/* Textarea (input layer) */}
					<textarea
						ref={textareaRef}
						value={code}
						onChange={handleChange}
						onPaste={handlePaste}
						onKeyDown={handleKeyDown}
						onScroll={handleScroll}
						spellCheck={false}
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						data-enable-grammarly="false"
						placeholder={placeholder}
						className={cn(
							"absolute inset-0 w-full h-full resize-none outline-none",
							"font-mono text-[13px] leading-6 p-4",
							"bg-transparent text-transparent caret-accent-green",
							"placeholder:text-text-muted",
							"overflow-auto whitespace-pre",
							showLineNumbers && "pl-14",
						)}
						style={{ tabSize: 2 }}
					/>

					{/* Character counter */}
					{code && (
						<div className="absolute bottom-2 right-3 font-mono text-[11px] pointer-events-none select-none">
							<span
								className={
									isOverLimit ? "text-accent-red" : "text-text-tertiary"
								}
							>
								{charCount.toLocaleString()} / {maxLength.toLocaleString()}
							</span>
						</div>
					)}
				</div>
			</div>
		);
	},
);

CodeEditor.displayName = "CodeEditor";

export { CodeEditor };
