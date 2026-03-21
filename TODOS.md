# TODOS

## P1 — Before Wider Rollout

### Add server-side API proxy for Claude API key
**What:** Replace client-side Claude API calls with a thin proxy (Cloudflare Worker / Vercel Edge Function / Supabase Edge Function) that holds the API key server-side. The mobile app calls the proxy, not Claude directly.
**Why:** The API key currently ships in the app binary, which is extractable. Anyone who decompiles the APK/IPA can run up your Claude bill with unlimited requests. This is acceptable for a 5-person pilot but must be fixed before any public distribution (TestFlight, Play Store, or sharing the APK).
**Effort:** human: ~2 hours / CC: ~15 min
**Blocked by:** Nothing. Can be done independently of other work.
**Context:** The proxy is ~50 lines — receive request from app, forward to Claude API with the key injected server-side, stream the response back. Add a simple rate limit (e.g., 100 requests/user/day) while you're at it.
