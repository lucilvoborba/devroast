# Roast Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to paste code, submit it for AI analysis via OpenAI GPT-4o, and see a dynamic result page with score, issues, suggested fixes, and a roast message.

**Architecture:** tRPC mutation (`roast.create`) orchestrates the flow: insert submission → call OpenAI → parse structured JSON → save issues/fixes → return ID. Client redirects to `/result/:id` where a server component loads data from DB via tRPC query.

**Tech Stack:** Next.js 16 (App Router), tRPC 11, Drizzle ORM, OpenAI SDK, Zod, React 19

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `.env.local` | Modify | Add `OPENAI_API_KEY` |
| `package.json` | Modify | Add `openai` dependency |
| `src/lib/roast-analyzer.ts` | **Create** | OpenAI integration, prompt building, response parsing |
| `src/trpc/routers/roast.ts` | **Create** | tRPC router with `create` mutation and `getById` query |
| `src/trpc/routers/_app.ts` | Modify | Register `roastRouter` |
| `src/components/roast-toggle.tsx` | Modify | Remove internal state, accept props from parent |
| `src/components/code-submit-section.tsx` | Modify | Own `roastMode` state, wire up tRPC mutation, loading/error states |
| `src/app/result/[id]/loading.tsx` | **Create** | Loading skeleton for result page |
| `src/app/result/[id]/page.tsx` | Modify | Replace hardcoded mockup with dynamic DB data |

---

### Task 1: Install OpenAI SDK

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install openai package**

```bash
npm install openai
```

- [ ] **Step 2: Verify installation**

```bash
grep '"openai"' package.json
```

Expected: `"openai": "^4.x.x"` in dependencies

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add openai SDK"
```

---

### Task 2: Create OpenAI Integration Module

**Files:**
- Create: `src/lib/roast-analyzer.ts`

- [ ] **Step 1: Create the roast-analyzer module**

```ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RoastAnalysis {
  score: number;
  roastMessage: string;
  issues: Array<{
    severity: "critical" | "warning" | "good";
    title: string;
    description: string;
    lineStart?: number;
    lineEnd?: number;
  }>;
  fixes: Array<{
    originalCode: string;
    fixedCode: string;
    explanation: string;
  }>;
}

const SARCASTIC_SYSTEM_PROMPT = `You are a brutally honest senior developer reviewing code at 2am after too much coffee. You're known for your sharp wit and zero tolerance for bad code patterns.

Analyze the submitted code and respond with a JSON object containing:
- score: number from 0 (perfect) to 10 (catastrophic disaster)
- roastMessage: 1-2 sentences of sarcastic, witty commentary about the code quality
- issues: array of 2-5 issues found, each with:
  - severity: "critical" | "warning" | "good"
  - title: short descriptive title (lowercase, no period)
  - description: detailed explanation (1-2 sentences)
  - lineStart (optional): starting line number
  - lineEnd (optional): ending line number
- fixes: array of 1-3 suggested fixes, each with:
  - originalCode: the problematic code snippet
  - fixedCode: the improved version
  - explanation: why the fix is better

Be creative with your roast. Use humor, sarcasm, and developer culture references. But still provide genuinely useful analysis.`;

const PROFESSIONAL_SYSTEM_PROMPT = `You are a senior software engineer conducting a thorough code review. Your feedback is constructive, professional, and focused on best practices.

Analyze the submitted code and respond with a JSON object containing:
- score: number from 0 (perfect) to 10 (needs complete rewrite)
- roastMessage: 1-2 sentences summarizing the overall code quality professionally
- issues: array of 2-5 issues found, each with:
  - severity: "critical" | "warning" | "good"
  - title: short descriptive title (lowercase, no period)
  - description: detailed explanation with specific improvement suggestions
  - lineStart (optional): starting line number
  - lineEnd (optional): ending line number
- fixes: array of 1-3 suggested fixes, each with:
  - originalCode: the problematic code snippet
  - fixedCode: the improved version
  - explanation: why the fix follows best practices

Focus on: code quality, readability, performance, security, and maintainability.`;

export async function analyzeCode(
  code: string,
  language: string,
  roastMode: boolean,
): Promise<RoastAnalysis> {
  const systemPrompt = roastMode
    ? SARCASTIC_SYSTEM_PROMPT
    : PROFESSIONAL_SYSTEM_PROMPT;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      },
    ],
    response_format: { type: "json_object" },
    temperature: roastMode ? 0.9 : 0.3,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = JSON.parse(content) as RoastAnalysis;

  if (
    typeof parsed.score !== "number" ||
    !Array.isArray(parsed.issues) ||
    !Array.isArray(parsed.fixes) ||
    typeof parsed.roastMessage !== "string"
  ) {
    throw new Error("Invalid response format from OpenAI");
  }

  return parsed;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/roast-analyzer.ts
git commit -m "feat: add OpenAI roast analyzer module"
```

---

### Task 3: Create tRPC Roast Router

**Files:**
- Create: `src/trpc/routers/roast.ts`
- Modify: `src/trpc/routers/_app.ts`

- [ ] **Step 1: Create the roast router**

```ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createAnalysisIssues,
  createSubmission,
  createSuggestedFixes,
  getSubmission,
  getSubmissionIssues,
  getSubmissionFixes,
  updateSubmissionAnalysis,
} from "@/db/queries";
import { analyzeCode } from "@/lib/roast-analyzer";
import { baseProcedure, createTRPCRouter } from "../init";

export const roastRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        code: z.string().min(1).max(2000),
        language: z.string().min(1).max(50),
        roastMode: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const submission = await createSubmission({
        code: input.code,
        language: input.language,
        lineCount: input.code.split("\n").length,
        roastMode: input.roastMode,
      });

      if (!submission) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create submission",
        });
      }

      try {
        const analysis = await analyzeCode(
          input.code,
          input.language,
          input.roastMode,
        );

        await updateSubmissionAnalysis(submission.id, {
          score: analysis.score,
          roastMessage: analysis.roastMessage,
          status: "analyzed",
        });

        await createAnalysisIssues(
          submission.id,
          analysis.issues.map((issue, i) => ({
            severity: issue.severity,
            title: issue.title,
            description: issue.description,
            lineStart: issue.lineStart,
            lineEnd: issue.lineEnd,
            position: i,
          })),
        );

        await createSuggestedFixes(
          submission.id,
          analysis.fixes.map((fix, i) => ({
            originalCode: fix.originalCode,
            fixedCode: fix.fixedCode,
            explanation: fix.explanation,
            position: i,
          })),
        );

        return { id: submission.id };
      } catch (error) {
        await updateSubmissionAnalysis(submission.id, {
          score: 0,
          roastMessage: "",
          status: "failed",
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Analysis failed",
          cause: error,
        });
      }
    }),

  getById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const submission = await getSubmission(input.id);

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      const [issues, fixes] = await Promise.all([
        getSubmissionIssues(input.id),
        getSubmissionFixes(input.id),
      ]);

      return {
        ...submission,
        issues,
        fixes,
      };
    }),
});
```

- [ ] **Step 2: Register router in _app.ts**

```ts
import { createTRPCRouter } from "../init";
import { leaderboardRouter } from "./leaderboard";
import { roastRouter } from "./roast";

export const appRouter = createTRPCRouter({
  leaderboard: leaderboardRouter,
  roast: roastRouter,
});

export type AppRouter = typeof appRouter;
```

- [ ] **Step 3: Commit**

```bash
git add src/trpc/routers/roast.ts src/trpc/routers/_app.ts
git commit -m "feat: add roast tRPC router with create and getById"
```

---

### Task 4: Refactor RoastToggle to Accept Props

**Files:**
- Modify: `src/components/roast-toggle.tsx`

- [ ] **Step 1: Refactor roast-toggle to be controlled by parent**

```tsx
"use client";

import { Toggle } from "@/components/ui";

interface RoastToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function RoastToggle({ checked, onCheckedChange }: RoastToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <Toggle
        checked={checked}
        onCheckedChange={onCheckedChange}
        label="roast mode"
      />
      <span className="font-mono text-xs text-text-tertiary">
        {"// maximum sarcasm enabled"}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/roast-toggle.tsx
git commit -m "refactor: make RoastToggle controlled by parent props"
```

---

### Task 5: Wire Up CodeSubmitSection

**Files:**
- Modify: `src/components/code-submit-section.tsx`

- [ ] **Step 1: Implement the full submission flow**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CodeEditor } from "@/components/code-editor";
import { RoastToggle } from "@/components/roast-toggle";
import { Button } from "@/components/ui";
import { useMutation } from "@/trpc/client";

const MAX_LENGTH = 2000;

export function CodeSubmitSection() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [roastMode, setRoastMode] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOverLimit = code.length > MAX_LENGTH;

  const roastMutation = useMutation({
    mutationKey: ["roast.create"],
    mutationFn: async () => {
      const response = await fetch("/api/trpc/roast.create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: { code, language, roastMode },
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error?.message || "Roast failed");
      }
      return data.result?.data?.json as { id: string };
    },
    onSuccess: (data) => {
      router.push(`/result/${data.id}`);
    },
    onError: (err) => {
      setError(err.message || "Something went wrong. Try again.");
    },
  });

  const handleSubmit = () => {
    setError(null);
    roastMutation.mutate();
  };

  return (
    <>
      {/* Code Editor */}
      <section className="w-full max-w-5xl">
        <CodeEditor
          code={code}
          onCodeChange={(newCode) => {
            setCode(newCode);
            setError(null);
          }}
          onLanguageChange={setLanguage}
          maxLength={MAX_LENGTH}
        />
      </section>

      {/* Actions Bar */}
      <section className="w-full max-w-5xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <RoastToggle checked={roastMode} onCheckedChange={setRoastMode} />
          <Button
            disabled={isOverLimit || code.length === 0 || roastMutation.isPending}
            onClick={handleSubmit}
          >
            {roastMutation.isPending ? "$ roasting..." : "$ roast_my_code"}
          </Button>
        </div>

        {error && (
          <p className="font-mono text-xs text-accent-red">
            {"// error: "}{error}
          </p>
        )}
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify tRPC client hook pattern**

Check that `useMutation` is properly exported from `src/trpc/client.tsx`. If it uses tanstack query's pattern, adjust accordingly. The current pattern uses `createTRPCOptionsProxy` which provides `trpc.roast.create.useMutation()` style hooks.

If the tRPC client doesn't export `useMutation` directly, use this alternative approach:

```tsx
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc/client";

// In the component:
const roastMutation = useMutation(trpc.roast.create.mutationOptions());
```

- [ ] **Step 3: Commit**

```bash
git add src/components/code-submit-section.tsx
git commit -m "feat: wire up code submission to tRPC roast mutation"
```

---

### Task 6: Create Result Page Loading Skeleton

**Files:**
- Create: `src/app/result/[id]/loading.tsx`

- [ ] **Step 1: Create the loading skeleton**

```tsx
export default function ResultLoading() {
  return (
    <main className="flex flex-col items-center px-20 py-10 gap-10">
      {/* Score Hero */}
      <section className="w-full max-w-5xl flex items-start gap-12">
        <span className="w-[120px] h-[120px] rounded-full bg-bg-surface animate-pulse shrink-0" />

        <div className="flex flex-col gap-4 flex-1">
          <span className="w-[200px] h-6 rounded bg-bg-surface animate-pulse" />
          <span className="w-full h-5 rounded bg-bg-surface animate-pulse" />
          <span className="w-[180px] h-4 rounded bg-bg-surface animate-pulse" />
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-5xl h-px bg-border-primary" />

      {/* Code Block Skeleton */}
      <section className="w-full max-w-5xl flex flex-col gap-4">
        <span className="w-[160px] h-4 rounded bg-bg-surface animate-pulse" />
        <div className="border border-border-primary rounded-lg overflow-hidden">
          <div className="h-10 border-b border-border-primary bg-bg-surface" />
          <div className="p-4 flex flex-col gap-3">
            {Array.from({ length: 6 }, (_, i) => (
              <span
                key={i}
                className="h-4 rounded bg-bg-surface animate-pulse"
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-5xl h-px bg-border-primary" />

      {/* Issues Skeleton */}
      <section className="w-full max-w-5xl flex flex-col gap-6">
        <span className="w-[160px] h-4 rounded bg-bg-surface animate-pulse" />
        <div className="grid grid-cols-2 gap-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 p-5 border border-border-primary rounded-lg"
            >
              <span className="w-[80px] h-5 rounded bg-bg-surface animate-pulse" />
              <span className="w-full h-4 rounded bg-bg-surface animate-pulse" />
              <span className="w-[80%] h-4 rounded bg-bg-surface animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/result/\[id\]/loading.tsx
git commit -m "feat: add loading skeleton for result page"
```

---

### Task 7: Convert Result Page to Dynamic

**Files:**
- Modify: `src/app/result/[id]/page.tsx`

- [ ] **Step 1: Replace static mockup with dynamic data loading**

The page needs to:
1. Accept `params`, await it, extract `id`
2. Call `caller.roast.getById({ id })`
3. Derive verdict from score
4. Generate file name from language
5. Generate diff lines from fixes
6. Render using existing UI components

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BadgeDot,
  BadgeLabel,
  BadgeRoot,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockLineNumbers,
  CodeBlockRoot,
  DiffLine,
  ScoreRing,
} from "@/components/ui";
import { caller } from "@/trpc/server";

export const metadata: Metadata = {
  title: "roast result — devroast",
  description: "your code got roasted. brutally.",
};

function getVerdict(score: number): { label: string; variant: "critical" | "warning" | "good" } {
  if (score <= 2) return { label: "verdict: clean_code", variant: "good" };
  if (score <= 5) return { label: "verdict: needs_work", variant: "warning" };
  if (score <= 7) return { label: "verdict: needs_serious_help", variant: "critical" };
  return { label: "verdict: catastrophe", variant: "critical" };
}

const LANG_EXTENSIONS: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  tsx: "tsx",
  jsx: "jsx",
  python: "py",
  go: "go",
  rust: "rs",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "cs",
  ruby: "rb",
  php: "php",
  swift: "swift",
  kotlin: "kt",
  dart: "dart",
  sql: "sql",
  html: "html",
  css: "css",
  json: "json",
  yaml: "yml",
  bash: "sh",
  dockerfile: "Dockerfile",
  plaintext: "txt",
};

function getFileName(language: string): string {
  const ext = LANG_EXTENSIONS[language] ?? language;
  return `submission.${ext}`;
}

function generateDiffLines(originalCode: string, fixedCode: string) {
  const originalLines = originalCode.split("\n");
  const fixedLines = fixedCode.split("\n");

  return [
    ...originalLines.map((line) => ({ variant: "removed" as const, code: line })),
    ...fixedLines.map((line) => ({ variant: "added" as const, code: line })),
  ];
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data;
  try {
    data = await caller.roast.getById({ id });
  } catch {
    notFound();
  }

  if (data.status !== "analyzed") {
    notFound();
  }

  const verdict = getVerdict(data.score ?? 10);
  const fileName = getFileName(data.language);

  return (
    <main className="flex flex-col items-center px-20 py-10 gap-10">
      {/* Score Hero */}
      <section className="w-full max-w-5xl flex items-start gap-12">
        <ScoreRing score={data.score ?? 0} className="shrink-0" />

        <div className="flex flex-col gap-4 flex-1">
          <BadgeRoot variant={verdict.variant}>
            <BadgeDot />
            <BadgeLabel>{verdict.label}</BadgeLabel>
          </BadgeRoot>

          <p className="font-mono text-xl text-text-primary leading-relaxed">
            &quot;{data.roastMessage}&quot;
          </p>

          <div className="flex items-center gap-4 font-mono text-xs text-text-tertiary">
            <span>lang: {data.language}</span>
            <span>·</span>
            <span>{data.lineCount} lines</span>
          </div>

          <div>
            <button
              type="button"
              disabled
              className="px-4 py-2 border border-border-primary rounded font-mono text-xs text-text-tertiary cursor-not-allowed opacity-50"
            >
              $ share_roast
            </button>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-5xl h-px bg-border-primary" />

      {/* Your Submission */}
      <section className="w-full max-w-5xl flex flex-col gap-4">
        <h2 className="font-mono text-sm font-bold">
          <span className="text-accent-green">{"//"}</span> your_submission
        </h2>

        <CodeBlockRoot>
          <CodeBlockHeader>
            <div className="flex gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-red" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent-amber" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent-green" />
            </div>
            <span className="flex-1" />
            <span className="font-mono text-xs text-text-tertiary">
              {fileName}
            </span>
          </CodeBlockHeader>
          <CodeBlockBody className="max-h-[424px] overflow-auto">
            <CodeBlockLineNumbers code={data.code} />
            <div className="flex-1 p-4">
              {data.code.split("\n").map((line, i) => (
                <span
                  key={`code-${i}`}
                  className="block font-mono text-xs leading-7 text-text-primary whitespace-pre"
                >
                  {line}
                </span>
              ))}
            </div>
          </CodeBlockBody>
        </CodeBlockRoot>
      </section>

      {/* Divider */}
      <div className="w-full max-w-5xl h-px bg-border-primary" />

      {/* Detailed Analysis */}
      {data.issues.length > 0 && (
        <section className="w-full max-w-5xl flex flex-col gap-6">
          <h2 className="font-mono text-sm font-bold">
            <span className="text-accent-green">{"//"}</span> detailed_analysis
          </h2>

          <div className="grid grid-cols-2 gap-5">
            {data.issues.map((issue) => (
              <div
                key={issue.id}
                className="flex flex-col gap-3 p-5 border border-border-primary rounded-lg"
              >
                <BadgeRoot variant={issue.severity}>
                  <BadgeDot />
                  <BadgeLabel>{issue.severity}</BadgeLabel>
                </BadgeRoot>
                <h3 className="font-mono text-sm font-medium text-text-primary">
                  {issue.title}
                </h3>
                <p className="font-mono text-xs text-text-secondary leading-relaxed">
                  {issue.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Divider */}
      {data.fixes.length > 0 && (
        <div className="w-full max-w-5xl h-px bg-border-primary" />
      )}

      {/* Suggested Fixes */}
      {data.fixes.length > 0 && (
        <section className="w-full max-w-5xl flex flex-col gap-6">
          <h2 className="font-mono text-sm font-bold">
            <span className="text-accent-green">{"//"}</span> suggested_fix
          </h2>

          {data.fixes.map((fix) => {
            const diffLines = generateDiffLines(fix.originalCode, fix.fixedCode);

            return (
              <div key={fix.id} className="flex flex-col gap-3">
                {data.fixes.length > 1 && (
                  <p className="font-mono text-xs text-text-secondary">
                    {fix.explanation}
                  </p>
                )}
                <div className="border border-border-primary rounded-lg overflow-hidden bg-bg-input">
                  <CodeBlockHeader>
                    <span className="font-mono text-xs text-text-secondary">
                      {fileName} → improved_{fileName}
                    </span>
                  </CodeBlockHeader>
                  <div className="py-1">
                    {diffLines.map((line, i) => (
                      <DiffLine
                        key={`diff-${fix.id}-${i}`}
                        variant={line.variant}
                        code={line.code}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/result/\[id\]/page.tsx
git commit -m "feat: make result page dynamic with DB data"
```

---

### Task 8: Environment Variable Setup

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add OPENAI_API_KEY placeholder**

Add to `.env.local`:

```
OPENAI_API_KEY=sk-your-key-here
```

- [ ] **Step 2: Add .env.local to .gitignore verification**

```bash
grep ".env.local" .gitignore
```

Expected: `.env.local` should be in `.gitignore`

- [ ] **Step 3: Commit (only if .env.example exists or needs creating)**

If a `.env.example` file doesn't exist, create one:

```
DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
OPENAI_API_KEY=sk-your-key-here
```

```bash
git add .env.example
git commit -m "chore: add .env.example with required environment variables"
```

---

### Task 9: End-to-End Verification

- [ ] **Step 1: Start dev server and test the flow**

```bash
npm run dev
```

- [ ] **Step 2: Test happy path**

1. Navigate to `http://localhost:3000`
2. Paste some code into the editor
3. Verify language auto-detects
4. Toggle roast mode on/off
5. Click `$ roast_my_code`
6. Verify loading state ("$ roasting...")
7. Verify redirect to `/result/:id`
8. Verify result page shows score, verdict, roast message, issues, fixes

- [ ] **Step 3: Test error path**

1. Set invalid `OPENAI_API_KEY` in `.env.local`
2. Submit code again
3. Verify inline error message appears
4. Verify button re-enables for retry

- [ ] **Step 4: Test edge cases**

1. Submit empty code → button should be disabled
2. Submit code over 2000 chars → button should be disabled
3. Visit `/result/nonexistent-id` → should show 404

- [ ] **Step 5: Run lint and typecheck**

```bash
npm run lint
npx tsc --noEmit
```

- [ ] **Step 6: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address verification issues for roast feature"
```
