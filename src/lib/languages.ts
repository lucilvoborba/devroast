export interface Language {
	name: string;
	id: string;
	shikiLang: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	src: () => Promise<any>;
}

export const LANGUAGES: Record<string, Language> = {
	javascript: {
		name: "JavaScript",
		id: "javascript",
		shikiLang: "javascript",
		src: () => import("shiki/langs/javascript.mjs"),
	},
	typescript: {
		name: "TypeScript",
		id: "typescript",
		shikiLang: "typescript",
		src: () => import("shiki/langs/typescript.mjs"),
	},
	tsx: {
		name: "TSX",
		id: "tsx",
		shikiLang: "tsx",
		src: () => import("shiki/langs/tsx.mjs"),
	},
	jsx: {
		name: "JSX",
		id: "jsx",
		shikiLang: "jsx",
		src: () => import("shiki/langs/jsx.mjs"),
	},
	python: {
		name: "Python",
		id: "python",
		shikiLang: "python",
		src: () => import("shiki/langs/python.mjs"),
	},
	go: {
		name: "Go",
		id: "go",
		shikiLang: "go",
		src: () => import("shiki/langs/go.mjs"),
	},
	rust: {
		name: "Rust",
		id: "rust",
		shikiLang: "rust",
		src: () => import("shiki/langs/rust.mjs"),
	},
	java: {
		name: "Java",
		id: "java",
		shikiLang: "java",
		src: () => import("shiki/langs/java.mjs"),
	},
	c: {
		name: "C",
		id: "c",
		shikiLang: "c",
		src: () => import("shiki/langs/c.mjs"),
	},
	cpp: {
		name: "C++",
		id: "cpp",
		shikiLang: "cpp",
		src: () => import("shiki/langs/cpp.mjs"),
	},
	csharp: {
		name: "C#",
		id: "csharp",
		shikiLang: "csharp",
		src: () => import("shiki/langs/csharp.mjs"),
	},
	ruby: {
		name: "Ruby",
		id: "ruby",
		shikiLang: "ruby",
		src: () => import("shiki/langs/ruby.mjs"),
	},
	php: {
		name: "PHP",
		id: "php",
		shikiLang: "php",
		src: () => import("shiki/langs/php.mjs"),
	},
	swift: {
		name: "Swift",
		id: "swift",
		shikiLang: "swift",
		src: () => import("shiki/langs/swift.mjs"),
	},
	kotlin: {
		name: "Kotlin",
		id: "kotlin",
		shikiLang: "kotlin",
		src: () => import("shiki/langs/kotlin.mjs"),
	},
	dart: {
		name: "Dart",
		id: "dart",
		shikiLang: "dart",
		src: () => import("shiki/langs/dart.mjs"),
	},
	sql: {
		name: "SQL",
		id: "sql",
		shikiLang: "sql",
		src: () => import("shiki/langs/sql.mjs"),
	},
	html: {
		name: "HTML",
		id: "html",
		shikiLang: "html",
		src: () => import("shiki/langs/html.mjs"),
	},
	css: {
		name: "CSS",
		id: "css",
		shikiLang: "css",
		src: () => import("shiki/langs/css.mjs"),
	},
	json: {
		name: "JSON",
		id: "json",
		shikiLang: "json",
		src: () => import("shiki/langs/json.mjs"),
	},
	yaml: {
		name: "YAML",
		id: "yaml",
		shikiLang: "yaml",
		src: () => import("shiki/langs/yaml.mjs"),
	},
	markdown: {
		name: "Markdown",
		id: "markdown",
		shikiLang: "markdown",
		src: () => import("shiki/langs/markdown.mjs"),
	},
	bash: {
		name: "Bash",
		id: "bash",
		shikiLang: "bash",
		src: () => import("shiki/langs/bash.mjs"),
	},
	dockerfile: {
		name: "Dockerfile",
		id: "dockerfile",
		shikiLang: "dockerfile",
		src: () => import("shiki/langs/dockerfile.mjs"),
	},
	plaintext: {
		name: "Plaintext",
		id: "plaintext",
		shikiLang: "text",
		src: () => Promise.resolve(),
	},
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);

export const HLJS_LANG_MAP: Record<string, string> = {
	javascript: "javascript",
	typescript: "typescript",
	xml: "html",
	"xml,html": "html",
	css: "css",
	python: "python",
	go: "go",
	rust: "rust",
	java: "java",
	c: "c",
	cpp: "cpp",
	"c++": "cpp",
	csharp: "csharp",
	ruby: "ruby",
	php: "php",
	swift: "swift",
	kotlin: "kotlin",
	dart: "dart",
	sql: "sql",
	json: "json",
	yaml: "yaml",
	markdown: "markdown",
	bash: "bash",
	shell: "bash",
	dockerfile: "dockerfile",
	tsx: "tsx",
	jsx: "jsx",
};

export function mapHljsToShiki(hljsLang: string | undefined): string {
	if (!hljsLang) return "plaintext";
	return HLJS_LANG_MAP[hljsLang] ?? hljsLang;
}
