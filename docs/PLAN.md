# Iron Vanguard — Implementation Plan

## Context

Iron Vanguard is an AI-First OML optimizer for Army ROTC cadets. This plan merges:
- **Design doc** (approved from /office-hours): AI-First architecture, 3-wave build, offline-first
- **Stitch "Duke Vanguard" project**: 15 production screens + complete design system ("Tactical Precision")

**Key decisions:**
1. **Hybrid approach** — use all Stitch UI designs but restructure navigation so AI Advisor is the home tab (AI-First), not tab 5.
2. **Design System First** — build component library matching Stitch tokens, then compose screens.
3. **Briefing-first home screen** — AI Advisor tab uses the Stitch advisor layout (metric cards + optimization paths + AI briefing card). Chat is accessed via a Floating Action Button (olive gradient, bottom-right) that opens a glassmorphism half-sheet chat overlay. AI-First in substance (AI generates all the content), not chat-first in form.
4. **Hold Scope** — no expansions beyond the approved design doc. Bulletproof implementation.

---

## Stitch Design System → React Native Component Library

### Design Tokens (from Stitch designTheme)

```
Colors:
  primary:            #343c0a (dark olive)
  primary_container:  #4b5320 (olive)
  secondary:          #6d5d2f (warm brown)
  secondary_container:#f5dea5 (light tan)
  tertiary:           #735c00 (gold)
  tertiary_container: #cca730 (bright gold)
  surface:            #f5faff (blue-white)
  surface_container_low: #e9f5ff
  surface_container:  #e0f0fd
  surface_container_high: #daeaf7
  surface_container_highest: #d5e5f1
  surface_container_lowest: #ffffff
  on_surface:         #0e1d26 (deep navy - NOT pure black)
  on_primary:         #ffffff
  error:              #ba1a1a
  outline:            #77786b
  outline_variant:    #c8c7b8

Typography:
  Display/Headlines:  Public Sans (tight letter-spacing -0.02em)
  Body:               Public Sans
  Labels:             Inter

Spacing: scale=1 (base 1rem)
Roundness: ROUND_FOUR (0.125rem–0.75rem, NO rounded-full except avatars)
```

### Design System Rules (enforce in component library)
1. **No-Line Rule:** No 1px solid borders for sectioning. Use background color shifts only.
2. **Glassmorphism:** Floating elements use rgba(245,250,255,0.8) + backdrop-blur(12px)
3. **Ghost Border:** Input field borders use outline_variant at 20% opacity
4. **Gradient CTAs:** Primary buttons use linear-gradient(135deg, primary, primary_container)
5. **No pure black:** Always use on_surface (#0e1d26)
6. **No rounded-full:** Use sm/md/lg radius only (military "rugged" feel)
7. **Gold is reward:** tertiary (#735c00) used sparingly for achievements/highlights

### Component Library (`src/components/`)

| Component | Stitch Source | RN Translation Notes |
|-----------|--------------|---------------------|
| VCard | All screens | Surface tier backgrounds, no borders, rounded-lg |
| VButton | Primary/Secondary/Tertiary | LinearGradient for primary CTA |
| VInput | Data entry screens | surface_container_low bg, ghost border on focus |
| VProgressBar | Dashboard pillar bars | Gradient fill (tertiary→tertiary_container) |
| VRankBadge | Leadership Log | secondary_container bg, rounded-sm, patch style |
| VGlassPanel | AI Advisor | BlurView (expo-blur) + semi-transparent surface |
| VMetricCard | Dashboard/ACFT | Score display + label + trend indicator |
| VTabBar | All screens (bottom nav) | 5 tabs with Material icons |
| VActivityItem | Dashboard log | No dividers, spacing-6 vertical separation |
| VChartLine | AFT Log trends | Victory Native or react-native-chart-kit |
| VConicGauge | Dashboard score | Custom SVG — conic gradient equivalent |
| VFAB | AI Advisor home | Olive gradient floating action button (56x56pt), bottom-right, opens chat sheet |
| VChatSheet | AI Advisor chat | Glassmorphism half-sheet overlay. Chat bubbles, typing indicator, streaming text. Swipe down to dismiss. |
| VEmptyState | All data screens | Illustration + headline + body + primary CTA. Warm, encouraging tone. |
| VSkeletonLoader | All screens | Shimmer animation matching surface_container tiers. Respects Reduce Motion. |

---

## Navigation Structure (AI-First Restructuring)

### Stitch Original → New AI-First Order

```
STITCH (tab order):          NEW (AI-First):
1. Dashboard          →      1. Advisor (AI Home) ← promoted to primary
2. GPA                →      2. Dashboard (Mission Profile)
3. ACFT               →      3. GPA (Academic Tracker)
4. Leadership         →      4. ACFT (Fitness Log)
5. Advisor            →      5. Leadership (Leadership Log)
```

### Expo Router File Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator with 5 tabs
│   ├── index.tsx            # Tab 1: AI Advisor (home)
│   ├── dashboard.tsx        # Tab 2: OML Dashboard
│   ├── academics.tsx        # Tab 3: Academic Tracker
│   ├── fitness.tsx          # Tab 4: ACFT Log
│   └── leadership.tsx       # Tab 5: Leadership Log
├── onboarding/
│   ├── _layout.tsx          # Stack navigator for onboarding
│   ├── welcome.tsx          # Cold start welcome
│   ├── year-group.tsx       # Step 1
│   ├── gpa.tsx              # Step 2
│   ├── aft.tsx              # Step 3
│   ├── leadership.tsx       # Step 4
│   └── branch.tsx           # Step 5
├── what-if.tsx              # What-if simulator (modal)
├── upload.tsx               # Upload & Sync (OCR) - Wave 3
├── canvas.tsx               # Canvas Integration - Wave 3
└── settings.tsx             # Profile & Settings
```

---

## Screen-by-Screen Implementation Map

### Wave 1 (Week 1-2): Core Loop

| Screen | Stitch Source | Key Components | Data |
|--------|-------------|----------------|------|
| **AI Advisor (Home)** | "AI Advisor" + "AI Advisor (AFT)" | Briefing-first layout: AI briefing card at top, key metric cards (AFT, GPA, Rank), optimization paths (Academic/Physical/Balanced). Olive gradient FAB (bottom-right) opens glassmorphism half-sheet chat overlay for questions. | LLM API, Context Engine, OML scores |
| **OML Dashboard** | "OML Dashboard" (both variants) | Projected score gauge, 3 pillar progress bars, activity log, AI insight card | SQLite scores, OML engine |
| **Academic Tracker** | "Academic Tracker" | GPA display, course list with grades, OML impact per course, "Simulate GPA" | Manual entry → SQLite |
| **ACFT Log** | "ACFT Log" + "AFT Log" | Readiness score, 6 event cards, trend chart, assessment history | Manual entry → SQLite |
| **Leadership Log** | "Leadership Log" | Pillar score, CST score, role cards, achievement badges, extracurriculars | Manual entry → SQLite |
| **Onboarding (5 screens)** | No Stitch equivalent — design spec below | Full-screen cards with surface_container_low bg, one input per screen, olive gradient "Next" button, step indicator dots (5), large display-lg prompts ("What year are you?"), VInput with ghost border. Welcome screen: centered Vanguard AI wordmark on surface bg, tagline "Your OML Mentor", olive gradient "Get Started" CTA. | → SQLite + MMKV |

### Wave 2 (Week 2-3): Intelligence Layer

| Screen | Stitch Source | Key Components |
|--------|-------------|----------------|
| **What-If Simulator** | "AI Advisor" what-if panel | Slider UI for each variable, real-time OML projection |
| **Dashboard Trends** | "AFT Log" chart patterns | Line charts for all 3 pillars over time |
| **AFT Event Scoring** | "ACFT Log" event cards | Age/gender bracket tables, alternate event handling |

### Wave 3 (Week 4+): Enhancement Layer

| Screen | Stitch Source | Key Components |
|--------|-------------|----------------|
| **Upload & Sync** | "Upload & Sync" (both) | Camera/gallery picker, OCR progress bar, extracted data preview |
| **Canvas Integration** | "Canvas Integration" | Course sync cards, "Establish Secure Link" flow, sync status |
| **Academic Tracker (Canvas)** | "Academic Tracker (Canvas)" | Live sync indicator, auto-populated grades, last sync timestamp |

---

## Interaction State Coverage

### State Table (every screen, every state)

| Screen | Loading | Empty | Error | Success | Partial |
|--------|---------|-------|-------|---------|---------|
| **AI Advisor (Home)** | Skeleton: 3 metric card placeholders shimmer, briefing card shows pulsing olive gradient | Cold start → onboarding redirect. Post-onboarding: "I'm analyzing your profile..." with olive spinner | "Vanguard AI is temporarily unavailable." + cached briefing card (if exists) + all metric cards still render from local data | Briefing card fades in (300ms ease), metric cards populate with trend arrows | Briefing loaded but one metric missing → show card with "--" and "Add your [AFT/GPA] to unlock this" |
| **OML Dashboard** | Conic gauge animates from 0, pillar bars grow left-to-right (staggered 100ms) | "Your Mission Profile awaits. Enter your first scores to see your OML projection." + primary CTA → onboarding/data entry | N/A (all local data — no network dependency) | Gauge lands on score, gold glow pulse on tertiary elements | Some pillars have data, others show "--/40" with "Tap to add" ghost text |
| **Academic Tracker** | Course list shows 3 skeleton rows | "No courses tracked yet." + illustration of open book + "Add Your First Course" primary button | N/A (local data) | Course row slides in from right (200ms) after save | GPA calculated from available courses, missing courses show "Add more courses for a complete picture" |
| **ACFT Log** | 6 event cards show shimmer, chart area shows skeleton wave | "No fitness assessments recorded." + illustration of running figure + "Log Your First ACFT" primary button | N/A (local data) | Score counter animates up, tier badge fades in with gold glow | Some events entered, others show "—" with tap target → entry form |
| **Leadership Log** | Role cards shimmer, badge area blank | "Your leadership journey starts here." + "Log Your First Role" button + brief explanation of leadership pillar | N/A (local data) | Role card slides in, badge unlocks with subtle scale animation (1.0→1.05→1.0) | Roles entered but no CST score → show CST card as "Pending" with info tooltip |
| **Onboarding** | Each step: input field ready, "Next" button active | N/A (always has prompts) | Validation error: field border transitions to error color (#ba1a1a) at 50% opacity, error text appears below | "Next" button olive gradient pulse on valid input | Step indicator shows progress (e.g., 3/5 filled dots) |
| **What-If Simulator** | Sliders render with current values, projection area shows "Calculating..." | Pre-populated with current scores (never truly empty) | OML engine error: "Couldn't calculate. Check your inputs." | Projected score animates (count-up), delta badge shows "+12 OML points" in tertiary gold | Some sliders adjusted, projection updates in real-time |
| **Upload & Sync** | Camera/gallery picker ready | "Scan your Accession Sheet to auto-fill scores." + camera icon illustration | OCR fails: "Couldn't read this document. Try a clearer photo or enter scores manually." + retry button | Progress bar fills → "Found: ACFT 582, GPA 3.74" → "Apply to Profile" CTA | Partial OCR: "Found some data, but couldn't read [field]. Enter manually?" |

### AI Chat UX Details

| Interaction | Specification |
|-------------|--------------|
| **User sends message** | Message appears instantly (right-aligned, surface_container_low bg). Chat input clears. |
| **AI thinking** | Three-dot typing indicator (olive dots, sequential pulse animation 600ms). Appears in left-aligned bubble with glass panel bg. |
| **AI streaming response** | Text streams in word-by-word. No bubble resize jank — bubble height animates smoothly. |
| **AI response complete** | Typing indicator → full response. If response includes score changes, inline metric card renders within the message. |
| **Daily briefing** | Briefing card at top of screen (not in chat). Fades in on app foreground (300ms). If data unchanged since last briefing, shows cached version instantly (no loading state). |
| **Network error mid-response** | Partial response shown + "Connection lost. Tap to retry." error chip below the partial text. |
| **Offline query** | User types → message appears → "I've saved your question. I'll respond when you're back online." (surface_container bg, italic, muted text). |

## User Journey & Emotional Arc

| Step | User Does | User Feels | Design Supports It With |
|------|-----------|-----------|------------------------|
| 1. First launch | Opens app | Curious but anxious ("will this judge me?") | Warm welcome: "I'm Vanguard AI — your OML mentor." No score display yet. Military aesthetic = credible, not intimidating. |
| 2. Onboarding | Enters year, GPA, AFT | Slightly vulnerable (sharing real numbers) | Progressive: one field per screen, large inputs, encouragement after each ("Got it."). No judgment on scores. |
| 3. First insight | Sees projected OML + #1 opportunity | Relief ("I can see where I stand") + motivation ("I know what to do") | Briefing card with specific, actionable advice. Gold tertiary accent on the opportunity — feels like a reward, not a grade. |
| 4. Daily return | Opens app, sees updated briefing | Habit forming ("my morning check") | Briefing regenerates only when data changed — no false urgency. Metric cards show trend arrows → progress is visible. |
| 5. Data entry | Logs new ACFT score | Anticipation ("did I improve?") | Instant feedback: "That 580 AFT pushed you up ~12 OML points" with gold animation. Score change feels like an achievement. |
| 6. What-if | Asks "what if I get an A in MSL 301?" | Strategic ("I'm in control") | Real-time projection. Delta shown in gold. Feels like a game, not a spreadsheet. |
| 7. Pre-branch selection | Checks OML obsessively | High anxiety ("will I get my branch?") | AI tone shifts: "You're tracking well for Infantry. Here's what to lock in this week." Confidence, not pressure. Branch target ranges shown as achievable zones, not pass/fail. |

**Emotional design principles:**
- **Gold = reward, olive = stability.** Never use error red for scores — even low scores are "opportunities" not failures.
- **Animation = confidence.** Score gauges animate up (never snap). Trend arrows are smooth. The app feels alive and responsive.
- **AI tone:** Professional but warm. Never says "you're behind" — says "your biggest opportunity is..."
- **No comparative ranking against peers.** The app shows YOUR trajectory, not your position vs. others. This reduces anxiety and increases agency.

## Technical Architecture

### OML Engine (`src/engine/oml.ts`)
Pure TypeScript, zero dependencies on AI. Deterministic calculation.
- Input: cadet profile (GPA, MSL GPA, AFT scores, leadership evals)
- Output: pillar scores, total OML, marginal gains per input
- AFT scoring tables loaded from `src/data/acft-tables.json`
- **Blocking dependency:** Validate against USACC Reg 145-1

### Context Engine (`src/engine/context.ts`)
Assembles cadet profile → structured JSON for LLM system prompt.
- Fields per design doc: profile, pillar scores, deltas, trends, last 5 turns
- Token budget: ~800 tokens
- Injects optimization heuristics (marginal OML gain per unit improvement)

### Storage Layer
- **MMKV:** Settings, preferences, AI response cache (daily briefing, last recommendation)
- **SQLite (expo-sqlite):** Score history, AFT assessments, course grades, leadership entries, conversation history, offline query queue

### AI Layer (`src/services/ai.ts`)
- Provider: Claude API (Sonnet for chat, Haiku for micro-insights)
- System prompt: OML domain knowledge + persona + guardrails + dynamic cadet context
- Daily briefing: generated on app foreground if >20h old AND data changed
- Offline: cached briefing fallback, query queue persisted to SQLite

---

## Build Sequence (Revised with Stitch)

### Phase 0: Foundation (Day 1-2)
1. Install dependencies: expo-router, zustand, react-native-mmkv, expo-sqlite, expo-blur
2. Create `DESIGN.md` in repo root — extract the Stitch design system spec ("The Modern Vanguard") including all 7 rules, color philosophy, typography pairing, component specs, and do's/don'ts. This is the single source of truth for the design system in the codebase.
3. Build design token file from Stitch designTheme → `src/theme/tokens.ts`
3. Build component library (VCard, VButton, VInput, VProgressBar, VRankBadge, VGlassPanel, VMetricCard, VTabBar, VActivityItem)
4. Set up tab navigation (5 tabs, AI-First order)
5. Set up SQLite schema + MMKV initialization

### Phase 1: Data Layer (Day 3-5)
1. OML calculation engine with tests
2. SQLite CRUD for: cadet profile, score history, AFT assessments, courses, leadership entries
3. Zustand stores: profile, scores, conversations
4. Data entry screens with validation (Academic Tracker, ACFT Log, Leadership Log)

### Phase 2: AI Integration (Day 6-8)
1. Context Engine (profile → JSON → system prompt)
2. Claude API integration (chat + micro-insights)
3. AI Advisor home screen (chat UI, daily briefing, optimization paths)
4. Cold start onboarding flow (5 screens)
5. Offline mode: MMKV caching, SQLite query queue, degraded AI UX

### Phase 3: Dashboard & Intelligence (Day 9-12)
1. OML Dashboard (score gauge, pillar bars, activity log)
2. What-if simulator (natural language in chat + standalone slider modal)
3. Trend charts (Victory Native)
4. AFT event-by-event scoring with configurable tables

### Phase 4: Polish & Enhancement (Day 13+)
1. Upload & Sync (camera, OCR) — Wave 3
2. Canvas Integration — Wave 3
3. Edge case handling, error states, empty states
4. Offline queue improvements

---

## Accessibility Requirements

- **Touch targets:** Minimum 44x44pt for all interactive elements (buttons, cards, inputs, tab bar items)
- **Color contrast:** on_surface (#0e1d26) on surface (#f5faff) = 15.3:1 ratio — exceeds WCAG AAA. Verify tertiary gold (#735c00) on surface meets 4.5:1 minimum for text.
- **Screen reader labels:** All VMetricCards get `accessibilityLabel` with full context (e.g., "AFT Score: 582 out of 600, trending up"). Tab bar icons get labels. Chart components get summary labels ("Performance trending upward over 6 months").
- **VoiceOver navigation:** Tab bar → screen content → action buttons. Logical reading order matches visual hierarchy.
- **Reduce Motion:** Respect `AccessibilityInfo.isReduceMotionEnabled`. Replace gauge animations with instant render. Replace shimmer loading with static placeholder text.
- **Dynamic Type:** Support iOS Dynamic Type / Android font scaling up to 200%. Test all screens at max font size — ensure no text truncation in metric cards.
- **No color-only indicators:** Trend arrows use shape (↑/↓) not just color. Pillar bars have labels, not just fill level.

## Verification Plan

1. **Component library:** Visual snapshot tests against Stitch screenshots
2. **OML Engine:** Unit tests with 3+ real cadet profiles, verify within ±1% of Accession Sheet
3. **AI Integration:** Test cold start → onboarding → first insight flow end-to-end
4. **Offline:** Toggle airplane mode, verify: calculator works, data entry works, AI shows cached briefing, query queues
5. **Navigation:** Verify AI Advisor is tab 1 (home), all 5 tabs accessible, deep links work
6. **Design fidelity:** Side-by-side comparison of each screen vs Stitch screenshot

## Critical Files to Create

```
src/
├── theme/
│   └── tokens.ts              # Stitch design tokens
├── components/
│   ├── VCard.tsx
│   ├── VButton.tsx
│   ├── VInput.tsx
│   ├── VProgressBar.tsx
│   ├── VRankBadge.tsx
│   ├── VGlassPanel.tsx
│   ├── VMetricCard.tsx
│   ├── VTabBar.tsx
│   ├── VActivityItem.tsx
│   ├── VChartLine.tsx
│   └── VConicGauge.tsx
├── engine/
│   ├── oml.ts                 # OML calculation engine
│   ├── oml.test.ts
│   ├── context.ts             # Context Engine for LLM
│   └── context.test.ts
├── services/
│   ├── ai.ts                  # Claude API integration
│   ├── storage.ts             # SQLite + MMKV helpers
│   └── offline.ts             # Offline queue management
├── stores/
│   ├── profile.ts             # Zustand - cadet profile
│   ├── scores.ts              # Zustand - score history
│   └── conversations.ts       # Zustand - AI chat history
├── data/
│   ├── acft-tables.json       # AFT scoring lookup tables
│   └── oml-config.json        # OML formula weights (configurable)
└── screens/                   # Screen-level compositions
    ├── AdvisorScreen.tsx
    ├── DashboardScreen.tsx
    ├── AcademicsScreen.tsx
    ├── FitnessScreen.tsx
    ├── LeadershipScreen.tsx
    ├── WhatIfModal.tsx
    └── onboarding/
        ├── WelcomeScreen.tsx
        ├── YearGroupScreen.tsx
        ├── GpaScreen.tsx
        ├── AftScreen.tsx
        ├── LeadershipScreen.tsx
        └── BranchScreen.tsx
```
