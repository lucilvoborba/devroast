# Roast Feature Design

## Overview

Implement the core roast feature: users paste code, submit it for AI analysis, and see a result page with score, issues, suggested fixes, and a roast message. Two modes: sarcastic (roast mode ON) and professional (roast mode OFF).

## Decisions

- **AI Provider:** OpenAI GPT-4o
- **Flow:** Synchronous — user waits, then redirected to `/result/:id`
- **Roast Modes:** Two distinct tones (sarcasm vs professional), same JSON schema
- **Error Handling:** Inline error on submit button with retry capability
- **Architecture:** tRPC mutation for submission, consistent with existing `leaderboard.ts` pattern
- **Share:** Out of scope for now

## Architecture

```
CodeSubmitSection (client) → tRPC roast.create (server mutation)
  → createSubmission() [DB]
  → OpenAI GPT-4o API call
  → parse JSON response
  → save issues/fixes [DB]
  → return { id }
  → client redirect → /result/:id (server component, tRPC query)
```

## Files to Create

### `src/lib/roast-analyzer.ts`
OpenAI integration module. Exports `analyzeCode(code, language, roastMode)` function.

- Uses `openai` npm package with GPT-4o model
- `response_format: { type: "json_object" }` for structured output
- Two system prompts: sarcastic persona vs professional reviewer
- Returns parsed JSON matching the schema below
- 30s timeout on API call

**Response Schema:**
```json
{
  "score": 3.5,
  "roastMessage": "1-2 sentences",
  "issues": [
    {
      "severity": "critical|warning|good",
      "title": "Short title",
      "description": "Detailed explanation",
      "lineStart": 5,
      "lineEnd": 8
    }
  ],
  "fixes": [
    {
      "originalCode": "bad snippet",
      "fixedCode": "fixed snippet",
      "explanation": "Why better"
    }
  ]
}
```

### `src/trpc/routers/roast.ts`
New tRPC router with two procedures:

1. **`create`** (mutation)
   - Input: `{ code: string (1-2000), language: string, roastMode: boolean }`
   - Creates submission (status: `pending`)
   - Calls `analyzeCode()`
   - Saves issues + fixes to DB
   - Updates submission to `status: "analyzed"` with score + roastMessage
   - On failure: sets `status: "failed"`, throws tRPC error
   - Returns: `{ id: string }`

2. **`getById`** (query)
   - Input: `{ id: string }`
   - Returns: submission + issues[] + fixes[] (ordered by position)
   - Throws NOT_FOUND if submission doesn't exist

### `src/app/result/[id]/loading.tsx`
Loading skeleton for the result page, following the same pattern as `src/app/leaderboard/loading.tsx`.

## Files to Modify

### `src/trpc/routers/_app.ts`
Register the new `roastRouter`:
```ts
export const appRouter = createTRPCRouter({
  leaderboard: leaderboardRouter,
  roast: roastRouter,
});
```

### `src/components/roast-toggle.tsx`
Expose `roastMode` state to parent via props:
- Accept `checked` and `onCheckedChange` props from parent
- Remove internal `useState`
- Parent (`CodeSubmitSection`) owns the state

### `src/components/code-editor.tsx`
No changes needed — already exposes `onLanguageChange` prop that fires when language detection completes or user manually selects a language.

### `src/components/code-submit-section.tsx`
Wire up the full submission flow:
1. Import tRPC `roast.create` mutation via `useMutation`
2. Own `roastMode` state (moved from `RoastToggle`)
3. Capture `language` via `CodeEditor`'s `onLanguageChange` prop
4. On button click: call mutation → redirect to `/result/${id}`
5. Loading state: disable button, show "roasting..." text
6. Error state: show inline error message, keep button enabled for retry

### `src/app/result/[id]/page.tsx`
Replace static mockup with dynamic data:
1. Accept `params: Promise<{ id: string }>`
2. Call `caller.roast.getById({ id })`
3. Derive **verdict badge** from score: `score <= 2` → `clean_code`, `score <= 5` → `needs_work`, `score <= 7` → `needs_serious_help`, `score > 7` → `catastrophe`
4. Derive **file name** from language: `{language}.ext` (e.g., `javascript.js`, `python.py`)
5. Generate **diff lines** from each fix's `originalCode`/`fixedCode`: split by `\n`, map to `{ variant: "removed", code }` / `{ variant: "added", code }` lines with `context` lines for surrounding code
6. Pass data to existing visual components (`ScoreRing`, issues list, `DiffLine` list)
7. `notFound()` if submission doesn't exist
8. Disable share button (out of scope)

## Data Flow

1. User types code → `CodeEditor` auto-detects language
2. User toggles roast mode (default: ON)
3. User clicks `$ roast_my_code`
4. `roast.create` mutation fires:
   - `INSERT INTO submissions` (status: pending)
   - `POST /v1/chat/completions` (OpenAI GPT-4o)
   - Parse JSON response
   - `INSERT INTO analysis_issues` + `INSERT INTO suggested_fixes`
   - `UPDATE submissions SET status='analyzed', score=..., roastMessage=...`
5. Return `{ id }` → `router.push(/result/${id})`
6. Result page server component queries DB → renders

## Error Handling

- **OpenAI timeout (30s):** mutation throws error, submission saved as `status: "failed"`
- **OpenAI rate limit:** same flow, user sees inline error
- **Invalid JSON response:** save as `failed`, throw error
- **Network error:** client shows inline error, button re-enabled
- **Submission not found:** `notFound()` on result page

## Environment Variables

- `OPENAI_API_KEY` — required, add to `.env.local`

## Dependencies

- `openai` — OpenAI Node.js SDK (install via npm)
