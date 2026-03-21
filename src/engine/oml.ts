/**
 * OML (Order of Merit List) Calculation Engine
 *
 * Pure TypeScript. Zero external dependencies. Deterministic.
 * Loads config from oml-config.json and scoring tables from acft-tables.json.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface ACFTScores {
  deadlift?: number;
  powerThrow?: number;
  pushUps?: number;
  sprintDragCarry?: number;
  plank?: number;
  twoMileRun?: number;
  legTuck?: number; // alternate for plank
}

export interface CadetProfile {
  gpa: number;
  mslGpa: number;
  acftScores: ACFTScores;
  leadershipEval: number;
  cstScore?: number;
  clcScore?: number;
  commandRoles: string[];
  extracurricularHours: number;
  yearGroup: 'MSI' | 'MSII' | 'MSIII' | 'MSIV';
  gender: 'M' | 'F';
  ageBracket: '17-21' | '22-26' | '27-31';
}

export interface OMLResult {
  totalScore: number;
  pillarScores: {
    academic: number;
    leadership: number;
    physical: number;
  };
  marginalGains: { [input: string]: number };
}

export interface OMLSubComponent {
  weight: number;
  inputRange: { min: number; max: number };
  description: string;
  pointsPerUnit?: number;
  scaleFactor?: number;
  cap?: number;
}

export interface OMLPillar {
  weight: number;
  maxContribution: number;
  subComponents: { [key: string]: OMLSubComponent };
}

export interface OMLConfig {
  version: string;
  scoreRange: { min: number; max: number };
  pillars: {
    academic: OMLPillar;
    leadership: OMLPillar;
    physical: OMLPillar;
  };
  validation: {
    gpa: { min: number; max: number };
    mslGpa: { min: number; max: number };
    leadershipEval: { min: number; max: number };
    cstScore: { min: number; max: number };
    clcScore: { min: number; max: number };
    commandRoles: { maxCount: number };
    extracurricularHours: { min: number; max: number };
    acftEventScore: { min: number; max: number };
  };
  yearGroups: string[];
  genders: string[];
  ageBrackets: string[];
}

export interface ACFTEventTable {
  [rawScore: string]: number;
}

export interface ACFTEvent {
  name: string;
  unit: string;
  ascending: boolean;
  male: { [ageBracket: string]: ACFTEventTable };
  female: { [ageBracket: string]: ACFTEventTable };
}

export interface ACFTAlternateEvent extends ACFTEvent {
  replaces: string;
}

export interface ACFTTables {
  version: string;
  events: { [eventId: string]: ACFTEvent };
  alternateEvents: { [eventId: string]: ACFTAlternateEvent };
}

// ─── Errors ──────────────────────────────────────────────────────────

export class ACFTTablesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ACFTTablesError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ─── Validation ──────────────────────────────────────────────────────

function validateRange(value: number, min: number, max: number, fieldName: string): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number, got ${value}`);
  }
  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}, got ${value}`
    );
  }
}

export function validateProfile(profile: CadetProfile, config: OMLConfig): void {
  const v = config.validation;

  validateRange(profile.gpa, v.gpa.min, v.gpa.max, 'gpa');
  validateRange(profile.mslGpa, v.mslGpa.min, v.mslGpa.max, 'mslGpa');
  validateRange(profile.leadershipEval, v.leadershipEval.min, v.leadershipEval.max, 'leadershipEval');

  if (profile.cstScore !== undefined) {
    validateRange(profile.cstScore, v.cstScore.min, v.cstScore.max, 'cstScore');
  }
  if (profile.clcScore !== undefined) {
    validateRange(profile.clcScore, v.clcScore.min, v.clcScore.max, 'clcScore');
  }

  validateRange(
    profile.extracurricularHours,
    v.extracurricularHours.min,
    v.extracurricularHours.max,
    'extracurricularHours'
  );

  if (!Array.isArray(profile.commandRoles)) {
    throw new ValidationError('commandRoles must be an array');
  }
  if (profile.commandRoles.length > v.commandRoles.maxCount) {
    throw new ValidationError(
      `commandRoles count must be at most ${v.commandRoles.maxCount}, got ${profile.commandRoles.length}`
    );
  }

  if (!config.yearGroups.includes(profile.yearGroup)) {
    throw new ValidationError(`Invalid yearGroup: ${profile.yearGroup}`);
  }
  if (!config.genders.includes(profile.gender)) {
    throw new ValidationError(`Invalid gender: ${profile.gender}`);
  }
  if (!config.ageBrackets.includes(profile.ageBracket)) {
    throw new ValidationError(`Invalid ageBracket: ${profile.ageBracket}`);
  }
}

// ─── ACFT Table Validation ───────────────────────────────────────────

export function validateACFTTables(tables: unknown): asserts tables is ACFTTables {
  if (!tables || typeof tables !== 'object') {
    throw new ACFTTablesError('ACFT tables data is missing or not an object');
  }

  const t = tables as Record<string, unknown>;

  if (!t.events || typeof t.events !== 'object') {
    throw new ACFTTablesError('ACFT tables missing "events" object');
  }

  const requiredEvents = [
    'deadlift',
    'powerThrow',
    'pushUps',
    'sprintDragCarry',
    'plank',
    'twoMileRun',
  ];
  const events = t.events as Record<string, unknown>;

  for (const eventId of requiredEvents) {
    if (!events[eventId] || typeof events[eventId] !== 'object') {
      throw new ACFTTablesError(`ACFT tables missing required event: ${eventId}`);
    }
    const ev = events[eventId] as Record<string, unknown>;
    if (!ev.male || !ev.female) {
      throw new ACFTTablesError(`Event "${eventId}" must have male and female tables`);
    }
  }
}

// ─── ACFT Scoring ────────────────────────────────────────────────────

/**
 * Look up a scaled score from the ACFT table.
 * Uses interpolation between nearest table entries.
 */
function lookupACFTScore(
  eventTable: ACFTEventTable,
  rawScore: number,
  ascending: boolean
): number {
  const entries = Object.entries(eventTable)
    .map(([k, v]) => [parseFloat(k), v] as [number, number])
    .sort((a, b) => a[0] - b[0]);

  if (entries.length === 0) return 0;

  if (ascending) {
    // Higher raw = better
    if (rawScore <= entries[0][0]) return entries[0][1];
    if (rawScore >= entries[entries.length - 1][0]) return entries[entries.length - 1][1];

    for (let i = 0; i < entries.length - 1; i++) {
      if (rawScore >= entries[i][0] && rawScore <= entries[i + 1][0]) {
        const fraction =
          (rawScore - entries[i][0]) / (entries[i + 1][0] - entries[i][0]);
        return Math.round(entries[i][1] + fraction * (entries[i + 1][1] - entries[i][1]));
      }
    }
  } else {
    // Lower raw = better (times)
    // Sorted ascending by raw value; lower raw → look from end
    if (rawScore <= entries[0][0]) return entries[0][1]; // best
    if (rawScore >= entries[entries.length - 1][0]) return entries[entries.length - 1][1]; // worst

    for (let i = 0; i < entries.length - 1; i++) {
      if (rawScore >= entries[i][0] && rawScore <= entries[i + 1][0]) {
        const fraction =
          (rawScore - entries[i][0]) / (entries[i + 1][0] - entries[i][0]);
        return Math.round(entries[i][1] + fraction * (entries[i + 1][1] - entries[i][1]));
      }
    }
  }

  return entries[entries.length - 1][1];
}

/**
 * Calculate total ACFT score (sum of 6 event scores, 0-600).
 */
export function calculateACFTTotal(
  scores: ACFTScores,
  gender: 'M' | 'F',
  ageBracket: string,
  tables: ACFTTables
): number {
  const genderKey = gender === 'M' ? 'male' : 'female';

  const eventMap: [keyof ACFTScores, string][] = [
    ['deadlift', 'deadlift'],
    ['powerThrow', 'powerThrow'],
    ['pushUps', 'pushUps'],
    ['sprintDragCarry', 'sprintDragCarry'],
    ['twoMileRun', 'twoMileRun'],
  ];

  let total = 0;

  for (const [scoreKey, eventId] of eventMap) {
    const raw = scores[scoreKey];
    if (raw === undefined || raw === null) continue;

    const event = tables.events[eventId];
    if (!event) continue;

    const bracketTable = event[genderKey]?.[ageBracket];
    if (!bracketTable) continue;

    total += lookupACFTScore(bracketTable, raw, event.ascending);
  }

  // Handle plank or leg tuck (alternate)
  if (scores.legTuck !== undefined && scores.legTuck !== null) {
    const altEvent = tables.alternateEvents?.legTuck;
    if (altEvent) {
      const bracketTable = altEvent[genderKey]?.[ageBracket];
      if (bracketTable) {
        total += lookupACFTScore(bracketTable, scores.legTuck, altEvent.ascending);
      }
    }
  } else if (scores.plank !== undefined && scores.plank !== null) {
    const event = tables.events.plank;
    if (event) {
      const bracketTable = event[genderKey]?.[ageBracket];
      if (bracketTable) {
        total += lookupACFTScore(bracketTable, scores.plank, event.ascending);
      }
    }
  }

  return total;
}

// ─── Pillar Calculations ─────────────────────────────────────────────

function calculateAcademicPillar(profile: CadetProfile, config: OMLConfig): number {
  const pillar = config.pillars.academic;
  const sub = pillar.subComponents;

  // Normalize GPA to 0-1 range, then apply sub-component weights
  const gpaScore = (profile.gpa / sub.cumulativeGpa.inputRange.max) * sub.cumulativeGpa.weight;
  const mslScore = (profile.mslGpa / sub.mslGpa.inputRange.max) * sub.mslGpa.weight;

  // Total academic is a weighted score scaled to pillar max contribution
  const normalizedTotal = gpaScore + mslScore; // 0 to 1
  return Math.round(normalizedTotal * pillar.maxContribution * 100) / 100;
}

function calculateLeadershipPillar(profile: CadetProfile, config: OMLConfig): number {
  const pillar = config.pillars.leadership;
  const sub = pillar.subComponents;

  let weightedSum = 0;
  let availableWeight = 0;

  // Commander's assessment (always required via leadershipEval)
  const cmdScore = profile.leadershipEval / sub.commanderAssessment.inputRange.max;
  weightedSum += cmdScore * sub.commanderAssessment.weight;
  availableWeight += sub.commanderAssessment.weight;

  // CST (optional)
  if (profile.cstScore !== undefined) {
    const cst = profile.cstScore / sub.cstScore.inputRange.max;
    weightedSum += cst * sub.cstScore.weight;
    availableWeight += sub.cstScore.weight;
  }

  // CLC (optional)
  if (profile.clcScore !== undefined) {
    const clc = profile.clcScore / sub.clcScore.inputRange.max;
    weightedSum += clc * sub.clcScore.weight;
    availableWeight += sub.clcScore.weight;
  }

  // Command positions
  const cmdPos = sub.commandPositions;
  const posCount = Math.min(profile.commandRoles.length, cmdPos.inputRange.max);
  const posScore = (posCount * (cmdPos.pointsPerUnit ?? 20)) / 100;
  weightedSum += Math.min(posScore, 1) * cmdPos.weight;
  availableWeight += cmdPos.weight;

  // Extracurriculars
  const extra = sub.extracurriculars;
  const extraScore = Math.min(
    profile.extracurricularHours * (extra.scaleFactor ?? 0.2),
    extra.cap ?? 100
  ) / 100;
  weightedSum += Math.min(extraScore, 1) * extra.weight;
  availableWeight += extra.weight;

  // Normalize to account for missing optional components
  // Scale up proportionally so partial data still fills the pillar
  const normalized = availableWeight > 0 ? weightedSum / availableWeight : 0;

  return Math.round(normalized * pillar.maxContribution * 100) / 100;
}

function calculatePhysicalPillar(
  profile: CadetProfile,
  config: OMLConfig,
  tables: ACFTTables
): number {
  const pillar = config.pillars.physical;
  const acftTotal = calculateACFTTotal(
    profile.acftScores,
    profile.gender,
    profile.ageBracket,
    tables
  );
  // ACFT total is 0-600. Scale to 0-200 (physical maxContribution).
  const maxACFT = pillar.subComponents.acft.inputRange.max; // 600
  const scaled = (acftTotal / maxACFT) * pillar.maxContribution;
  return Math.round(scaled * 100) / 100;
}

// ─── Marginal Gains ──────────────────────────────────────────────────

function calculateMarginalGains(
  profile: CadetProfile,
  config: OMLConfig,
  tables: ACFTTables,
  baseTotal: number
): { [input: string]: number } {
  const gains: { [input: string]: number } = {};

  // GPA +0.1
  if (profile.gpa + 0.1 <= 4.0) {
    const tweaked = { ...profile, gpa: profile.gpa + 0.1 };
    const result = computeTotal(tweaked, config, tables);
    gains['gpa+0.1'] = Math.round((result - baseTotal) * 100) / 100;
  }

  // MSL GPA +0.1
  if (profile.mslGpa + 0.1 <= 4.0) {
    const tweaked = { ...profile, mslGpa: profile.mslGpa + 0.1 };
    const result = computeTotal(tweaked, config, tables);
    gains['mslGpa+0.1'] = Math.round((result - baseTotal) * 100) / 100;
  }

  // Leadership eval +5
  if (profile.leadershipEval + 5 <= 100) {
    const tweaked = { ...profile, leadershipEval: profile.leadershipEval + 5 };
    const result = computeTotal(tweaked, config, tables);
    gains['leadershipEval+5'] = Math.round((result - baseTotal) * 100) / 100;
  }

  // Extracurricular hours +10
  if (profile.extracurricularHours + 10 <= 500) {
    const tweaked = { ...profile, extracurricularHours: profile.extracurricularHours + 10 };
    const result = computeTotal(tweaked, config, tables);
    gains['extracurricularHours+10'] = Math.round((result - baseTotal) * 100) / 100;
  }

  // ACFT individual events - small raw improvement
  const acftEvents: (keyof ACFTScores)[] = [
    'deadlift',
    'powerThrow',
    'pushUps',
    'sprintDragCarry',
    'plank',
    'twoMileRun',
    'legTuck',
  ];

  for (const event of acftEvents) {
    const current = profile.acftScores[event];
    if (current === undefined) continue;

    // For descending events (times), improvement means decrease
    let delta = 1;
    if (event === 'sprintDragCarry' || event === 'twoMileRun') {
      delta = -5; // 5 seconds faster
    } else if (event === 'deadlift') {
      delta = 10; // 10 lbs more
    } else if (event === 'powerThrow') {
      delta = 0.5; // 0.5m farther
    } else if (event === 'pushUps') {
      delta = 5; // 5 more reps
    } else if (event === 'plank') {
      delta = 15; // 15 more seconds
    } else if (event === 'legTuck') {
      delta = 1; // 1 more rep
    }

    const tweakedScores = { ...profile.acftScores, [event]: current + delta };
    const tweaked = { ...profile, acftScores: tweakedScores };
    const result = computeTotal(tweaked, config, tables);
    const label = `acft.${event}${delta > 0 ? '+' : ''}${delta}`;
    gains[label] = Math.round((result - baseTotal) * 100) / 100;
  }

  return gains;
}

/**
 * Internal helper: compute raw total without marginal gains (avoids recursion).
 */
function computeTotal(
  profile: CadetProfile,
  config: OMLConfig,
  tables: ACFTTables
): number {
  const academic = calculateAcademicPillar(profile, config);
  const leadership = calculateLeadershipPillar(profile, config);
  const physical = calculatePhysicalPillar(profile, config, tables);
  return Math.round((academic + leadership + physical) * 100) / 100;
}

// ─── Main Entry Point ────────────────────────────────────────────────

export function calculateOML(
  profile: CadetProfile,
  config: OMLConfig,
  acftTables: ACFTTables
): OMLResult {
  // Validate ACFT tables structure
  validateACFTTables(acftTables);

  // Validate profile inputs
  validateProfile(profile, config);

  const academic = calculateAcademicPillar(profile, config);
  const leadership = calculateLeadershipPillar(profile, config);
  const physical = calculatePhysicalPillar(profile, config, acftTables);

  const totalScore = Math.round((academic + leadership + physical) * 100) / 100;

  const marginalGains = calculateMarginalGains(profile, config, acftTables, totalScore);

  return {
    totalScore,
    pillarScores: {
      academic,
      leadership,
      physical,
    },
    marginalGains,
  };
}
