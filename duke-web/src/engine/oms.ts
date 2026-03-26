/**
 * OMS (Order of Merit Score) Engine — FY2026 100-Point Model
 *
 * Based on USACC Circular 601-26-1 (FY2026 ROTC Accessions)
 *
 * Academic: max 29 (GPA 22, ADM 2, Language 5)
 * Leadership: max 62 (CER ~25, Training 5, Maturity 5, CST 25, RECONDO 2)
 * Physical: max 9 (Fall AFT 2, Spring AFT 4, Athletics 3)
 *
 * Two modes:
 * - Planning: illustrative linear estimates (clearly labeled approximate)
 * - Exact: cadets enter AMS subcategory values from official scorecard
 *
 * Pure TypeScript. Zero external dependencies. Deterministic.
 */

// ─── Types ───────────────────────────────────────────────────

export interface OMSProfile {
  // Academic (max 29)
  gpa: number;                    // 0-4.0 cumulative
  mslGpa?: number;                // 0-4.0 MSL GPA (uses cumulative if not provided)
  adm: number;                    // 0-2 Academic Discipline Mix
  languageCultural: number;       // 0-5 Language/Cultural Awareness

  // Leadership (max 62)
  cerScore: number;               // 0-25 PMS evaluation
  trainingExtracurricular: number; // 0-285 activity points (capped at 100 → 5 OMS)
  maturityResponsibility: number; // 0-5
  cstScore: number;               // 0-25 Cadet Summer Training
  recondo: boolean;               // +2 if earned

  // Physical (max 9)
  fallAft: number;                // 0-600 fall AFT raw score
  springAft: number;              // 0-600 spring AFT raw score
  athletics: number;              // 0-3

  // Metadata
  yearGroup: 'MSI' | 'MSII' | 'MSIII' | 'MSIV';
  gender: 'M' | 'F';
  ageBracket: '17-21' | '22-26' | '27-31';

  // Mode
  mode: 'planning' | 'exact';
  amsValues?: AMSValues;
}

export interface AMSValues {
  academicPoints: number;
  leadershipPoints: number;
  physicalPoints: number;
  totalOMS: number;
}

export interface OMSPillarBreakdown {
  total: number;
  max: number;
  subComponents: Record<string, { value: number; max: number; label: string }>;
}

export interface OMSResult {
  totalOMS: number;
  academic: OMSPillarBreakdown;
  leadership: OMSPillarBreakdown;
  physical: OMSPillarBreakdown;
  mode: 'planning' | 'exact';
  marginalGains: Array<{ input: string; label: string; delta: number; pillar: string }>;
  nextBestAction: string;
  roiComparison: Array<{ pillar: string; label: string; pointsPerHour: number; color: string }>;
  disclaimer: string;
}

// ─── Constants ───────────────────────────────────────────────

const DISCLAIMER_PLANNING = 'Planning estimate — uses illustrative linear scaling. Official OMS uses standardized scores in CCIMM. Not comparable across fiscal years.';
const DISCLAIMER_EXACT = 'Based on your AMS values. What-if deltas are approximate.';

// ─── Planning Mode Calculator ────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeAcademic(profile: OMSProfile): OMSPillarBreakdown {
  // Accessions GPA = combo of cumulative + MSL GPA
  // If MSL GPA provided, use weighted average (60% cumulative, 40% MSL)
  const effectiveGpa = profile.mslGpa != null && profile.mslGpa > 0
    ? profile.gpa * 0.6 + profile.mslGpa * 0.4
    : profile.gpa;

  const gpaPoints = clamp(22 * (effectiveGpa / 4.0), 0, 22);
  const admPoints = clamp(profile.adm, 0, 2);
  const langPoints = clamp(profile.languageCultural, 0, 5);
  const total = clamp(gpaPoints + admPoints + langPoints, 0, 29);

  return {
    total,
    max: 29,
    subComponents: {
      gpa: { value: Math.round(gpaPoints * 100) / 100, max: 22, label: 'Accessions GPA' },
      adm: { value: admPoints, max: 2, label: 'Academic Discipline Mix' },
      language: { value: langPoints, max: 5, label: 'Language/Cultural' },
    },
  };
}

function computeLeadership(profile: OMSProfile): OMSPillarBreakdown {
  const cerPoints = clamp(profile.cerScore, 0, 25);

  // Training/Extracurricular: 285 possible activity points, but 100 = full 5 OMS
  const activityPoints = clamp(profile.trainingExtracurricular, 0, 285);
  const trainingPoints = clamp((Math.min(activityPoints, 100) / 100) * 5, 0, 5);

  const maturityPoints = clamp(profile.maturityResponsibility, 0, 5);
  const cstPoints = clamp(profile.cstScore, 0, 25);
  const recondoPoints = profile.recondo ? 2 : 0;

  const total = clamp(cerPoints + trainingPoints + maturityPoints + cstPoints + recondoPoints, 0, 62);

  return {
    total,
    max: 62,
    subComponents: {
      cer: { value: cerPoints, max: 25, label: 'PMS Evaluation (CER)' },
      training: { value: Math.round(trainingPoints * 100) / 100, max: 5, label: 'Training/Extracurricular' },
      maturity: { value: maturityPoints, max: 5, label: 'Maturity/Responsibility' },
      cst: { value: cstPoints, max: 25, label: 'Cadet Summer Training' },
      recondo: { value: recondoPoints, max: 2, label: 'RECONDO' },
    },
  };
}

function computePhysical(profile: OMSProfile): OMSPillarBreakdown {
  const fallPoints = clamp((profile.fallAft / 600) * 2, 0, 2);
  const springPoints = clamp((profile.springAft / 600) * 4, 0, 4);
  const athleticsPoints = clamp(profile.athletics, 0, 3);
  const total = clamp(fallPoints + springPoints + athleticsPoints, 0, 9);

  return {
    total,
    max: 9,
    subComponents: {
      fallAft: { value: Math.round(fallPoints * 100) / 100, max: 2, label: 'Fall AFT' },
      springAft: { value: Math.round(springPoints * 100) / 100, max: 4, label: 'Spring AFT' },
      athletics: { value: athleticsPoints, max: 3, label: 'Athletics' },
    },
  };
}

// ─── Marginal Gains ──────────────────────────────────────────

function computeMarginalGains(profile: OMSProfile, currentTotal: number): OMSResult['marginalGains'] {
  const gains: OMSResult['marginalGains'] = [];

  // GPA +0.1
  const gpaUp = { ...profile, gpa: Math.min(profile.gpa + 0.1, 4.0) };
  const gpaAcad = computeAcademic(gpaUp);
  const gpaDelta = gpaAcad.total - computeAcademic(profile).total;
  if (gpaDelta > 0) {
    gains.push({ input: 'gpa', label: 'GPA +0.1', delta: Math.round(gpaDelta * 100) / 100, pillar: 'academic' });
  }

  // ADM +1
  if (profile.adm < 2) {
    gains.push({ input: 'adm', label: 'ADM +1 point', delta: 1, pillar: 'academic' });
  }

  // Language +1
  if (profile.languageCultural < 5) {
    gains.push({ input: 'language', label: 'Language/Cultural +1', delta: 1, pillar: 'academic' });
  }

  // Training +20 activity points
  if (profile.trainingExtracurricular < 100) {
    const tUp = { ...profile, trainingExtracurricular: Math.min(profile.trainingExtracurricular + 20, 100) };
    const tDelta = computeLeadership(tUp).total - computeLeadership(profile).total;
    if (tDelta > 0) {
      gains.push({ input: 'training', label: 'Training +20 activity pts', delta: Math.round(tDelta * 100) / 100, pillar: 'leadership' });
    }
  }

  // CST +5
  if (profile.cstScore < 25) {
    gains.push({ input: 'cst', label: 'CST +5 points', delta: 5, pillar: 'leadership' });
  }

  // CER +5
  if (profile.cerScore < 25) {
    gains.push({ input: 'cer', label: 'CER +5 points', delta: 5, pillar: 'leadership' });
  }

  // Fall AFT +50
  if (profile.fallAft < 600) {
    const fUp = { ...profile, fallAft: Math.min(profile.fallAft + 50, 600) };
    const fDelta = computePhysical(fUp).total - computePhysical(profile).total;
    gains.push({ input: 'fallAft', label: 'Fall AFT +50 points', delta: Math.round(fDelta * 100) / 100, pillar: 'physical' });
  }

  // Spring AFT +50
  if (profile.springAft < 600) {
    const sUp = { ...profile, springAft: Math.min(profile.springAft + 50, 600) };
    const sDelta = computePhysical(sUp).total - computePhysical(profile).total;
    gains.push({ input: 'springAft', label: 'Spring AFT +50 points', delta: Math.round(sDelta * 100) / 100, pillar: 'physical' });
  }

  // Sort by delta descending
  gains.sort((a, b) => b.delta - a.delta);
  return gains;
}

// ─── ROI Comparison ──────────────────────────────────────────

function computeROI(): OMSResult['roiComparison'] {
  return [
    { pillar: 'academic', label: '1 hr studying ≈ +0.055 OMS', pointsPerHour: 0.055, color: '#f8e19e' },
    { pillar: 'leadership', label: '1 hr leadership ≈ +0.050 OMS', pointsPerHour: 0.050, color: '#d9b9ff' },
    { pillar: 'physical', label: '1 hr training ≈ +0.013 OMS', pointsPerHour: 0.013, color: '#c3cc8c' },
  ];
}

// ─── Next Best Action ────────────────────────────────────────

function computeNextBestAction(profile: OMSProfile, gains: OMSResult['marginalGains']): string {
  if (gains.length === 0) return 'All pillars are at maximum. Maintain your scores.';

  const top = gains[0];

  // Check for unclaimed easy wins
  if (profile.languageCultural === 0) {
    return 'Quick win: claim Language/Cultural Awareness points (up to +5 OMS). Upload DLPT scores, study abroad certificates, or language course transcripts.';
  }

  if (profile.trainingExtracurricular < 100 && profile.trainingExtracurricular > 0) {
    const remaining = 100 - profile.trainingExtracurricular;
    return `You need ${remaining} more activity points to hit the training cap (= full 5 OMS). Volunteer for one more leadership role or community service.`;
  }

  if (profile.adm === 0) {
    return 'Check if your major qualifies for Academic Discipline Mix points (+2 OMS). STEM and certain high-demand fields earn this automatically.';
  }

  return `Most efficient move: ${top.label} → +${top.delta.toFixed(2)} OMS (${top.pillar} pillar).`;
}

// ─── Main Calculator ─────────────────────────────────────────

export function calculateOMS(profile: OMSProfile): OMSResult {
  // Exact mode: use AMS values directly
  if (profile.mode === 'exact' && profile.amsValues) {
    const ams = profile.amsValues;
    return {
      totalOMS: ams.totalOMS,
      academic: {
        total: ams.academicPoints,
        max: 29,
        subComponents: {
          gpa: { value: ams.academicPoints, max: 22, label: 'AMS Academic' },
          adm: { value: 0, max: 2, label: 'Included in AMS' },
          language: { value: 0, max: 5, label: 'Included in AMS' },
        },
      },
      leadership: {
        total: ams.leadershipPoints,
        max: 62,
        subComponents: {
          cer: { value: ams.leadershipPoints, max: 25, label: 'AMS Leadership' },
          training: { value: 0, max: 5, label: 'Included in AMS' },
          maturity: { value: 0, max: 5, label: 'Included in AMS' },
          cst: { value: 0, max: 25, label: 'Included in AMS' },
          recondo: { value: 0, max: 2, label: 'Included in AMS' },
        },
      },
      physical: {
        total: ams.physicalPoints,
        max: 9,
        subComponents: {
          fallAft: { value: ams.physicalPoints, max: 2, label: 'AMS Physical' },
          springAft: { value: 0, max: 4, label: 'Included in AMS' },
          athletics: { value: 0, max: 3, label: 'Included in AMS' },
        },
      },
      mode: 'exact',
      marginalGains: [],
      nextBestAction: 'Enter individual subcategory values for detailed what-if analysis.',
      roiComparison: computeROI(),
      disclaimer: DISCLAIMER_EXACT,
    };
  }

  // Planning mode: compute from inputs
  const academic = computeAcademic(profile);
  const leadership = computeLeadership(profile);
  const physical = computePhysical(profile);
  const totalOMS = Math.round((academic.total + leadership.total + physical.total) * 100) / 100;

  const marginalGains = computeMarginalGains(profile, totalOMS);
  const nextBestAction = computeNextBestAction(profile, marginalGains);

  return {
    totalOMS,
    academic,
    leadership,
    physical,
    mode: 'planning',
    marginalGains,
    nextBestAction,
    roiComparison: computeROI(),
    disclaimer: DISCLAIMER_PLANNING,
  };
}

// ─── Convenience: Create default profile ─────────────────────

export function createDefaultOMSProfile(): OMSProfile {
  return {
    gpa: 0,
    mslGpa: 0,
    adm: 0,
    languageCultural: 0,
    cerScore: 0,
    trainingExtracurricular: 0,
    maturityResponsibility: 0,
    cstScore: 0,
    recondo: false,
    fallAft: 0,
    springAft: 0,
    athletics: 0,
    yearGroup: 'MSIII',
    gender: 'M',
    ageBracket: '22-26',
    mode: 'planning',
  };
}

// ─── Convenience: Build profile from score history ───────────

export function profileFromScores(
  gpa: number | null,
  mslGpa: number | null,
  acftTotal: number | null,
  leadershipEval: number | null,
  cstScore: number | null,
): OMSProfile {
  return {
    ...createDefaultOMSProfile(),
    gpa: gpa ?? 0,
    mslGpa: mslGpa ?? undefined,
    // Split ACFT total evenly between fall/spring as rough estimate
    fallAft: acftTotal ? Math.round(acftTotal / 2) : 0,
    springAft: acftTotal ? Math.round(acftTotal / 2) : 0,
    cerScore: leadershipEval ?? 0,
    cstScore: cstScore ?? 0,
  };
}
