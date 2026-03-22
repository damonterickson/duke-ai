# Iron Vanguard — Project Instructions

## Overview
AI-First OML optimizer for Army ROTC cadets. Expo React Native app with OpenRouter API integration.

## Key commands
- `npx expo start` — start dev server
- `npx expo start --web` — web mode (limited, no SQLite)
- `npx expo start --android` — Android emulator
- `npx tsc --noEmit` — TypeScript check (ignore test file errors — need tsconfig jest types)

## Architecture
- **AI-First:** AI Advisor is tab 1 (home), not a secondary feature
- **Offline-first:** SQLite + AsyncStorage for local data, Zustand for runtime state
- **Design system:** "Modern Vanguard" — see DESIGN.md for rules (No-Line Rule, glassmorphism, etc.)
- **OML Engine:** Pure TypeScript in src/engine/oml.ts — deterministic, no AI dependency

## File structure
- `app/` — Expo Router screens (tabs, onboarding, modals)
- `src/components/` — 17 design system components (V-prefixed, includes VGoalCard, VAIResponse)
- `src/engine/` — OML calculator + Context Engine + tests
- `src/services/` — AI (OpenRouter), storage (SQLite/AsyncStorage), offline queue, goal engine
- `src/stores/` — Zustand state (profile, scores, conversations, goals)
- `src/theme/` — Design tokens from Stitch
- `src/data/` — ACFT scoring tables, OML config (both JSON, configurable)
- `docs/` — Design doc, implementation plan, test plan

## Design tokens
All colors, typography, and spacing are in `src/theme/tokens.ts`. Use snake_case property names (e.g., `colors.on_surface`, `typography.label_sm`, `spacing[4]`).

## Android Emulator Debugging (WSL2)

The Android emulator runs on Windows. ADB is accessible from WSL via a wrapper script at `~/.local/bin/adb` that calls the Windows ADB binary.

### Setup
The ADB wrapper at `~/.local/bin/adb` must pass args correctly:
```bash
#!/bin/bash
/mnt/c/Users/e88be/AppData/Local/Android/Sdk/platform-tools/adb.exe "$@"
```

### Port Forwarding Chain
```
Emulator:8081 → (adb reverse) → Windows:8081 → (portproxy) → WSL:172.x.x.x:8081
```
Metro runs in WSL on port 8081. The emulator connects through this chain.

### Common Debug Commands
```bash
# Check emulator is connected
adb devices

# Set up port forwarding (usually already done)
adb reverse tcp:8081 tcp:8081

# Take screenshot from emulator
adb exec-out screencap -p > /tmp/screenshot.png

# Read JS error logs
adb logcat -d 2>&1 | grep "ReactNativeJS.*E" | tail -20

# Clear logs then capture fresh ones
adb logcat -c && sleep 10 && adb logcat -d | grep "ReactNativeJS"

# Clear app data (reset onboarding, DB, etc.)
adb shell pm clear host.exp.exponent

# Force stop and relaunch
adb shell am force-stop host.exp.exponent
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081" host.exp.exponent

# Find exact UI element positions (for ADB tap testing)
adb shell uiautomator dump /sdcard/ui.xml
adb pull /sdcard/ui.xml /tmp/ui.xml
grep 'content-desc="Button Label"' /tmp/ui.xml  # find bounds

# Tap at specific coordinates
adb shell input tap <x> <y>

# Type text (use %s for spaces)
adb shell input text "hello%sworld"
```

### Workflow
1. Start Metro in WSL: `npx expo start --port 8081`
2. Launch on emulator: `adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081" host.exp.exponent`
3. Check for errors: `adb logcat -d | grep "ReactNativeJS.*E"`
4. Take screenshots: `adb exec-out screencap -p > /tmp/screen.png`
5. Use `Read` tool on the PNG to view it inline

### Known Limitations
- `adb shell input tap` coordinates are fragile — use `uiautomator dump` to find exact bounds
- Metro must be restarted with `--clear` after changing `.env` or native deps
- Expo Go doesn't support native modules (MMKV, expo-blur) — use AsyncStorage instead
- Streaming (ReadableStream) doesn't work in Expo Go/Hermes — use non-streaming API calls

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