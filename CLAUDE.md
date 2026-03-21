# Iron Vanguard — Project Instructions

## Overview
AI-First OML optimizer for Army ROTC cadets. Expo React Native app with Claude API integration.

## Key commands
- `npx expo start` — start dev server
- `npx expo start --web` — web mode (limited, no SQLite/MMKV)
- `npx expo start --android` — Android emulator
- `npx tsc --noEmit` — TypeScript check (ignore test file errors — need tsconfig jest types)

## Architecture
- **AI-First:** AI Advisor is tab 1 (home), not a secondary feature
- **Offline-first:** SQLite + MMKV for local data, Zustand for runtime state
- **Design system:** "Modern Vanguard" — see DESIGN.md for rules (No-Line Rule, glassmorphism, etc.)
- **OML Engine:** Pure TypeScript in src/engine/oml.ts — deterministic, no AI dependency

## File structure
- `app/` — Expo Router screens (tabs, onboarding, modals)
- `src/components/` — 15 design system components (V-prefixed)
- `src/engine/` — OML calculator + Context Engine + tests
- `src/services/` — AI (Claude API), storage (SQLite/MMKV), offline queue
- `src/stores/` — Zustand state management
- `src/theme/` — Design tokens from Stitch
- `src/data/` — ACFT scoring tables, OML config (both JSON, configurable)
- `docs/` — Design doc, implementation plan, test plan

## Design tokens
All colors, typography, and spacing are in `src/theme/tokens.ts`. Use snake_case property names (e.g., `colors.on_surface`, `typography.label_sm`, `spacing[4]`).

## Important notes
- API key is client-side for pilot (see TODOS.md for P1 proxy task)
- ACFT scoring tables use placeholder data — replace with real FM 7-22 data
- OML formula weights are configurable in src/data/oml-config.json

## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /review, /ship, /browse, /qa, /qa-only, /design-review,
/setup-browser-cookies, /retro, /investigate, /document-release, /codex, /careful,
/freeze, /guard, /unfreeze, /gstack-upgrade.