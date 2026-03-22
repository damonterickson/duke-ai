# TODOS

## P1 — Before Wider Rollout

### Add server-side API proxy for Claude API key
**What:** Replace client-side Claude API calls with a thin proxy (Cloudflare Worker / Vercel Edge Function / Supabase Edge Function) that holds the API key server-side. The mobile app calls the proxy, not Claude directly.
**Why:** The API key currently ships in the app binary, which is extractable. Anyone who decompiles the APK/IPA can run up your Claude bill with unlimited requests. This is acceptable for a 5-person pilot but must be fixed before any public distribution (TestFlight, Play Store, or sharing the APK).
**Effort:** human: ~2 hours / CC: ~15 min
**Blocked by:** Nothing. Can be done independently of other work.
**Context:** The proxy is ~50 lines — receive request from app, forward to Claude API with the key injected server-side, stream the response back. Add a simple rate limit (e.g., 100 requests/user/day) while you're at it.

## P1 — Goals Infrastructure

### Add user confirmation gate for AI-generated goal actions
**What:** Before executing goal create/update/complete/retire actions parsed from AI responses, show the user a confirmation UI listing the proposed changes. Only execute after user approval.
**Why:** The AI controls database writes with no user gate — a hallucinating or prompt-injected model can mutate persistent goals arbitrarily. This is a trust boundary violation (untrusted LLM output treated as trusted commands).
**Effort:** human: ~4 hours / CC: ~15 min
**Blocked by:** Nothing.
**Context:** `goalEngine.ts` parses a `goals` JSON block from AI responses. Currently `index.tsx` executes all actions immediately in `onComplete`. Add an intermediate "Proposed Changes" sheet that shows what the AI wants to do and lets the user accept/reject each action. Found by Codex + Claude adversarial review (2026-03-22).

### Fix race condition on 5-goal cap
**What:** Add a mutex or database-level constraint to prevent concurrent `addGoal` calls from bypassing the 5 active goal limit.
**Why:** Two concurrent calls both read the same active count (e.g., 4), both pass the `>= 5` check, both insert — resulting in 6+ active goals. No lock, no DB constraint, Zustand `set` happens after async insert.
**Effort:** human: ~1 hour / CC: ~5 min
**Blocked by:** Nothing.
**Context:** In `src/stores/goals.ts` lines 53-59. Fix options: (a) async mutex around `addGoal`, (b) SQLite trigger that rejects inserts when 5 active goals exist, or (c) check count inside a transaction. Found by Claude adversarial review (2026-03-22).

### Support inverse metrics in goal progress (lower-is-better)
**What:** Add a `direction` field to goals (`'higher'` | `'lower'`) so progress calculation and completion detection work correctly for metrics like two-mile run time.
**Why:** Progress is computed as `currentValue / targetValue` which assumes higher is better. A cadet with a 15:00 two-mile targeting 13:00 shows 115% progress (clamped to 100%) — looks completed when they haven't improved. `checkGoalProgress` has the same bug: `newValue >= target` marks completion, wrong for lower-is-better.
**Effort:** human: ~2 hours / CC: ~10 min
**Blocked by:** Nothing.
**Context:** Affects `src/services/goalEngine.ts` (line 76), `src/components/VGoalCard.tsx` (line 64), `app/goal/[id].tsx` (line 81). Add `direction` to `GoalRow`, default `'higher'`, invert the comparison when `'lower'`. Found by Claude adversarial review (2026-03-22).

### Surface goal write errors to user instead of silent console.error
**What:** Replace `console.error` + silent return in all goal store operations with proper error propagation so the UI can show feedback when writes fail.
**Why:** All error handlers in `goals.ts` just `console.error` and return silently. The caller has no way to know the operation failed. The UI appears to succeed while data is silently lost.
**Effort:** human: ~1 hour / CC: ~5 min
**Blocked by:** Nothing.
**Context:** Affects `updateGoalProgress`, `completeGoal`, `removeGoal`, `addGoal` in `src/stores/goals.ts`. Either return success/failure booleans, throw errors for callers to catch, or use a toast/snackbar notification system. Found by Claude adversarial review (2026-03-22).
