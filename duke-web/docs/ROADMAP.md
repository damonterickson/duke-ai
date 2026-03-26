# Duke Vanguard — Product Roadmap

Source: [Deep Research Report](./deep-research-report.md)

## Feature Candidates

Each item below is a standalone feature to be evaluated, planned, and built independently.

---

### 1. OMS Engine Rewrite (100-Point FY2026 Model)
**Priority:** Foundation — blocks everything else
**What:** Replace current 1000-point OML engine with the real FY2026 OMS 100-point model
**Why:** Current model uses wrong weights (40/40/20). Real model: Academic 29, Leadership 62, Physical 9
**Key details:**
- Accessions GPA worth 22/100 — highest single input
- GPA = combination of Academic GPA + ROTC GPA with specific rules
- Physical bucket is only 9 points total (fall AFT: 2, spring AFT: 4, athletics: 3)
- OMS values not comparable year-to-year — must label estimates as "planning mode"
**Complexity:** Medium | **Impact:** Very High

---

### 2. GPA What-If + Sensitivity Heat Map
**Priority:** High
**What:** Interactive heat map showing how GPA changes affect OMS points
**Why:** GPA is worth 22/100 OMS points — highest single lever. Cadets waste time on low-ROI activities
**Key details:**
- Two modes: "Exact" (anchored to AMS values) and "Planning" (illustrative estimate)
- Heat map: X=projected GPA, Y=course scenarios, cells=ΔOMS
- "Next best action" callout: raise ROTC GPA vs academic GPA
- Illustrative formula: Est. GPA points ≈ 22 × (GPA / 4.0)
**Complexity:** Medium | **Impact:** High

---

### 3. Hidden Points Audit + Evidence Packets
**Priority:** High
**What:** Tax-prep style workflow that audits all possible OMS point sources and tracks evidence
**Why:** Cadets routinely miss "hidden points" in language, extracurriculars, employment, athletics
**Key details:**
- Language/Cultural Awareness: max 5 points (DLPT, study abroad, Rosetta Stone, etc.)
- Training/Extracurricular: max 5 points (285 available but capped at 100 = full 5 OMS)
- Maturity/Responsibility: max 5 points (employment, Green-to-Gold rules)
- Athletics: max 3 points (varsity/intramural/community)
- For each source: "Do you have this?" + "Can you prove it?" + upload evidence
- Output: "Missing Points Packet" with timeline aligned to accessions deadlines
**Complexity:** Medium | **Impact:** High

---

### 4. AFT Event ROI Planner
**Priority:** Medium-High
**What:** Event-specific training planner that shows marginal OMS points per improvement
**Why:** AFT scoring has "cliffs" — small improvements at thresholds yield discrete point jumps
**Key details:**
- Input current event performances → compute AFT score from official tables
- Show "closest next scoring threshold" per event
- Map AFT deltas to OMS delta ranges (conservative, labeled as planning estimate)
- Schedule workouts proportional to available time
- Physical bucket is only 9 OMS points — cadets may over-invest here vs GPA
**Complexity:** Medium | **Impact:** Medium-High

---

### 5. CST Blue Card + ACER Simulator
**Priority:** High
**What:** Leadership evaluation rehearsal mapped to ALRM and CST evaluation artifacts
**Why:** CST is worth up to 25 OMS points — the single highest leadership sub-component
**Key details:**
- Rubric library aligned to 6 ALRM buckets (Character, Presence, Intellect, Leads, Develops, Achieves)
- Blue Card rehearsal: scenario → choose behaviors → score against rubric → generate if-then plan
- Feedback ingestion: what happened / what went well / one behavior to adjust
- ACER Preview: self-rate each ALRM category → generate camp-ready development plan
- Post-camp continuation plan mapping "needs improvement" to on-campus actions
**Complexity:** High | **Impact:** High

---

### 6. Branch Predictor (Probabilistic)
**Priority:** High
**What:** Decision-support tool showing branch likelihood with uncertainty bands
**Why:** TBB uses multiple inputs (OMS, interviews, ratings, preferences) — cadets need clarity
**Key details:**
- Tier 1: Controllable readiness signals (interviews done? ratings received? AMS verified?)
- Tier 2: Competitive position (percentile within cohort, not raw OMS)
- Tier 3: Historical calibration (broad bands only: Low/Medium/High, never "92.4%")
- "Next Best Action" panel: one action for this week
- "Policy Reality Check" banner: "No predictor can guarantee branching"
- NEVER display raw OMS comparisons across years
**Complexity:** High | **Impact:** High (motivation), Medium (accuracy)

---

### 7. Micro-Cohort Accountability System
**Priority:** Medium-High
**What:** Opt-in accountability pods (5-9 cadets) with structured weekly check-ins
**Why:** Supportive accountability + SDT relatedness reliably improve adherence
**Key details:**
- Weekly check-in script: "what I did / what blocked me / what I'll do next"
- Progress displayed as process metrics (sessions logged, workouts completed) not raw OMS
- Privacy-preserving: nicknames, rounded scores, or Bronze/Silver/Gold bands
- Credibility role: peer mentor, MSIV, or vetted coach
- No unit-wide default leaderboards — opt-in micro-cohorts only
**Complexity:** Medium | **Impact:** Medium-High

---

### 8. Weekly Smart Plan + Behavior Change System
**Priority:** Medium
**What:** Weekly planning tool: 1 academic + 1 fitness + 1 leadership action with if-then plans
**Why:** Implementation intentions (if-then plans) have strong meta-analytic support for follow-through
**Key details:**
- Auto-suggest based on capped vs uncapped levers
- If-then plan builder: "If [trigger], then I will [action]"
- One-tap logging for study sessions, workouts, leadership reflections
- Evidence capture workflows (photo/scan → label → checklist)
- No infinite-scroll feeds — time-boxed content modules
**Complexity:** Medium | **Impact:** Medium

---

## Policy & Compliance Notes

- **FERPA:** Data minimization, user-controlled exports, clear consent, separation between public social and private academic data
- **OPSEC:** Never encourage posting training schedules/locations. Automated reminders in content workflows
- **OMS Non-Comparability:** Always label cross-year estimates as "planning mode" with explicit disclaimers
- **Dark Pattern Avoidance:** Opt-in notifications, no doom feeds, granular controls, default to privacy

## Source Documents
- FY2026 ROTC Accessions Circular (USACC Circular 601-26-1)
- CST Policy Memorandum 20 (Evaluations & Appeals 2025)
- USACC Form 1059 (Advanced Camp Evaluation Report)
- ADP 6-22 / FM 6-22 (Army Leadership)
- Official AFT/ACFT Scoring Tables (June 2025)
