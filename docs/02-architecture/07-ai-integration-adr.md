# ADR-007: AI Integration Strategy — Azure Foundry and Suggestion APIs

**Status:** Accepted  
**Date:** 2026-02-21  
**Deciders:** Technical Lead, Product Owner

---

## Context

House of Veritas uses AI to assist users when selecting from predefined options (assignee, project,
category, storage location, etc.). The platform needed a consistent approach for AI integration,
provider choice, and graceful degradation when AI is unavailable.

---

## Decision Drivers

1. **Cost** — Minimize API spend; use lightweight models where possible
2. **Reliability** — Features must work without AI (fallback to first option or manual selection)
3. **Consistency** — One pattern for all suggestion APIs
4. **Vendor lock-in** — Prefer OpenAI-compatible APIs for portability

---

## Decisions

### 1. Provider: Azure AI Foundry (OpenAI-compatible)

- **Endpoint:** Azure OpenAI / AI Foundry chat completions API
- **Model:** `gpt-4o-mini` (default) — cost-effective for short suggestion tasks
- **Environment variables:** `AZURE_AI_ENDPOINT`, `AZURE_AI_KEY`, `AZURE_AI_DEPLOYMENT` (or `AZURE_OPENAI_*` variants)

### 2. Fallback Behavior

When AI is not configured or the request fails:

- Return the **first option** from the provided list (deterministic, no randomness)
- Never block the user — suggestions are optional enhancements
- Log errors for debugging; do not surface AI failures to the user

### 3. API Pattern for Suggestions

- **Route:** `POST /api/ai/suggest-{domain}` (e.g. `suggest-assignee`, `suggest-project-member`)
- **Request:** JSON body with context (description, options, exclusions)
- **Response:** `{ options: string[] }` — ordered suggestions, or `{ options: [firstOption] }` on fallback
- **UI:** "Suggest" / Sparkles button next to Select; user can accept or ignore

### 4. AI Busy Indicator (Consistent UX)

All AI suggestion buttons use a **consistent loading pattern**:

- **Idle:** Sparkles icon (✨) — signals AI-assisted action
- **Loading:** Loader2 icon with `animate-spin` — signals in-progress
- **Component:** `components/ui/ai-suggest-icon.tsx` — shared `AiSuggestIcon` with `loading`, `size` (sm/md/lg)
- **Accessibility:** `role="status"`, `aria-busy`, `aria-label` when loading
- **Sizes:** `sm` (h-3 w-3), `md` (h-4 w-4), `lg` (h-5 w-5) — use `sm` for inline "Refine" buttons,
  `md` for primary Suggest buttons
- **Best practice:** Show indicator after ~200ms to avoid flicker on fast responses; disable button while loading

### 5. Shared Library

- **Location:** `lib/ai/azure-foundry.ts`
- **Functions:** `suggestStorageLocation`, `suggestCategory`, `suggestAssignee`, etc.
- **Common behavior:** System prompt + user prompt → chat completion → parse exact option from list

---

## Implemented Suggestion APIs

| API | Use Case |
| ----- | ---------- |
| `POST /api/ai/suggest-storage` | Asset storage location |
| `POST /api/ai/suggest-category` | Asset category |
| `POST /api/ai/suggest-project` | Task/expense project |
| `POST /api/ai/suggest-project-from-photo` | Project from uploaded image |
| `POST /api/ai/suggest-assignee` | Task assignee |
| `POST /api/ai/suggest-project-member` | Project member (by responsibilities) |
| `POST /api/ai/suggest-expense-category` | Expense category |
| `POST /api/ai/suggest-priority` | Task priority |

---

## Consequences

- **Positive:** Consistent UX, low cost, no user-facing failures
- **Negative:** First-option fallback may be suboptimal; users can always choose manually
- **Future:** Document type classification, vehicle selection, etc. can follow the same pattern
