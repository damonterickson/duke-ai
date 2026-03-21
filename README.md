# Iron Vanguard

An AI-First OML (Order of Merit List) optimizer for Army ROTC cadets. Built with Expo React Native.

## What it does

Iron Vanguard helps ROTC cadets understand, track, and maximize their OML score — the ranking that determines their Army branch and duty station. Instead of wrestling with spreadsheets, cadets get a personal AI mentor that tells them exactly what to focus on.

- **AI Advisor** — Vanguard AI analyzes your profile and tells you where to focus ("Your 2-mile run is worth more OML points than a 0.1 GPA bump")
- **OML Dashboard** — See your projected score, pillar breakdown (Academics 40%, Leadership 40%, Physical 20%), and trends
- **What-If Simulator** — Model scenarios ("What if I get an A in MSL 301?") with real-time OML projections
- **ACFT Log** — Track all 6 fitness events with scoring tables
- **Academic Tracker** — GPA and course tracking with OML impact per course
- **Leadership Log** — Command roles, CST scores, extracurriculars

## Getting started

```bash
# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Add your Claude API key to .env

# Start the app
npx expo start
```

Then open the app with:
- **Expo Go** on your phone (scan QR code)
- **Android Emulator** — `npx expo start --android`
- **iOS Simulator** (macOS only) — `npx expo start --ios`
- **Web** (limited) — `npx expo start --web`

## Architecture

```
Vanguard AI (Briefing + FAB Chat)  ← AI-First home screen
Context Engine                      ← Assembles cadet profile for LLM
OML Engine | Fitness Log | Leadership Log  ← Data layers
MMKV (cache) + SQLite (structured data)    ← Offline-first storage
```

The app is **AI-First** — the AI Advisor is the home tab, not a secondary feature. The AI generates the daily briefing, optimization recommendations, and micro-insights after every data entry.

**Offline-first:** All data entry and OML calculations work without network. AI features degrade gracefully (cached briefing, queued queries).

## Tech stack

- **Framework:** Expo React Native (iOS, Android, Web)
- **Navigation:** Expo Router (file-based, 5-tab layout)
- **AI:** Claude API (Sonnet for chat, Haiku for micro-insights)
- **Storage:** SQLite (expo-sqlite) + MMKV (react-native-mmkv)
- **State:** Zustand
- **Design System:** "Modern Vanguard" — military olive/gold aesthetic, glassmorphism, no borders

## Project structure

```
app/                    # Expo Router screens
  (tabs)/               # 5-tab navigation (Advisor, Dashboard, GPA, ACFT, Leadership)
  onboarding/           # 6-screen first-launch flow
src/
  components/           # 15 design system components (VCard, VButton, etc.)
  engine/               # OML calculator + Context Engine
  services/             # AI, storage, offline queue
  stores/               # Zustand state (profile, scores, conversations)
  theme/                # Design tokens
  data/                 # ACFT scoring tables, OML config
docs/                   # Design doc, implementation plan, test plan
```

## Design system

See [DESIGN.md](DESIGN.md) for the full "Modern Vanguard" design system including:
- Color palette (olive primary, gold tertiary, surface tiers)
- 7 design rules (No-Line Rule, glassmorphism, ghost borders, etc.)
- Typography (Public Sans + Inter)
- Component specifications

## Documentation

- [DESIGN.md](DESIGN.md) — Design system specification
- [docs/PLAN.md](docs/PLAN.md) — Implementation plan
- [docs/design-doc.md](docs/design-doc.md) — Architecture design doc
- [docs/test-plan.md](docs/test-plan.md) — Test plan and edge cases
- [TODOS.md](TODOS.md) — Known work items

## License

Private — not open source.
