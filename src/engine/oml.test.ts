import {
  calculateOML,
  calculateACFTTotal,
  validateProfile,
  ValidationError,
  ACFTTablesError,
  type CadetProfile,
  type OMLConfig,
  type ACFTTables,
} from './oml';

import omlConfig from '../data/oml-config.json';
import acftTables from '../data/acft-tables.json';

const config = omlConfig as unknown as OMLConfig;
const tables = acftTables as unknown as ACFTTables;

// ─── Test Fixtures ───────────────────────────────────────────────────

function makeFullProfile(): CadetProfile {
  return {
    gpa: 3.5,
    mslGpa: 3.8,
    acftScores: {
      deadlift: 300,
      powerThrow: 10.0,
      pushUps: 50,
      sprintDragCarry: 100,
      plank: 200,
      twoMileRun: 830,
    },
    leadershipEval: 85,
    cstScore: 80,
    clcScore: 75,
    commandRoles: ['Platoon Leader', 'Squad Leader'],
    extracurricularHours: 100,
    yearGroup: 'MSIII',
    gender: 'M',
    ageBracket: '17-21',
  };
}

function makeMaxProfile(): CadetProfile {
  return {
    gpa: 4.0,
    mslGpa: 4.0,
    acftScores: {
      deadlift: 380,
      powerThrow: 12.5,
      pushUps: 70,
      sprintDragCarry: 93,
      plank: 250,
      twoMileRun: 780,
    },
    leadershipEval: 100,
    cstScore: 100,
    clcScore: 100,
    commandRoles: ['BN CDR', 'CO CDR', 'PL', 'SL', 'TL'],
    extracurricularHours: 500,
    yearGroup: 'MSIV',
    gender: 'M',
    ageBracket: '17-21',
  };
}

function makeMinProfile(): CadetProfile {
  return {
    gpa: 0.0,
    mslGpa: 0.0,
    acftScores: {
      deadlift: 0,
      powerThrow: 0,
      pushUps: 0,
      sprintDragCarry: 9999,
      plank: 0,
      twoMileRun: 9999,
    },
    leadershipEval: 0,
    commandRoles: [],
    extracurricularHours: 0,
    yearGroup: 'MSI',
    gender: 'M',
    ageBracket: '17-21',
  };
}

// ─── Tests ───────────────────────────────────────────────────────────

describe('calculateOML', () => {
  test('happy path: full profile returns correct OML structure', () => {
    const profile = makeFullProfile();
    const result = calculateOML(profile, config, tables);

    expect(result).toHaveProperty('totalScore');
    expect(result).toHaveProperty('pillarScores');
    expect(result).toHaveProperty('marginalGains');
    expect(result.pillarScores).toHaveProperty('academic');
    expect(result.pillarScores).toHaveProperty('leadership');
    expect(result.pillarScores).toHaveProperty('physical');

    // Total should be sum of pillars
    const pillarSum =
      result.pillarScores.academic +
      result.pillarScores.leadership +
      result.pillarScores.physical;
    expect(result.totalScore).toBeCloseTo(pillarSum, 1);

    // Score should be within valid range
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.totalScore).toBeLessThanOrEqual(1000);
  });

  test('max scores produce max OML (1000)', () => {
    const profile = makeMaxProfile();
    const result = calculateOML(profile, config, tables);

    // Academic pillar max: 400
    expect(result.pillarScores.academic).toBe(400);

    // Leadership pillar max: 400
    expect(result.pillarScores.leadership).toBe(400);

    // Physical pillar max: 200 (600/600 * 200)
    expect(result.pillarScores.physical).toBeCloseTo(200, 0);

    // Total should be 1000
    expect(result.totalScore).toBe(1000);
  });

  test('minimum scores (0.0 GPA, 0 ACFT) produce valid low score', () => {
    const profile = makeMinProfile();
    const result = calculateOML(profile, config, tables);

    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.pillarScores.academic).toBe(0);
    expect(result.pillarScores.leadership).toBe(0);
    // Physical may have some floor from table lookups
    expect(result.pillarScores.physical).toBeGreaterThanOrEqual(0);
  });

  test('partial data: only GPA and ACFT, no leadership scores', () => {
    const profile: CadetProfile = {
      gpa: 3.0,
      mslGpa: 3.2,
      acftScores: {
        deadlift: 240,
        powerThrow: 8.0,
        pushUps: 40,
        sprintDragCarry: 120,
        plank: 150,
        twoMileRun: 960,
      },
      leadershipEval: 0,
      commandRoles: [],
      extracurricularHours: 0,
      yearGroup: 'MSII',
      gender: 'F',
      ageBracket: '22-26',
    };

    const result = calculateOML(profile, config, tables);

    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.pillarScores.academic).toBeGreaterThan(0);
    expect(result.pillarScores.leadership).toBe(0);
    expect(result.pillarScores.physical).toBeGreaterThan(0);
  });

  test('alternate event: Leg Tuck replaces Plank', () => {
    const profile = makeFullProfile();
    profile.acftScores = {
      deadlift: 300,
      powerThrow: 10.0,
      pushUps: 50,
      sprintDragCarry: 100,
      twoMileRun: 830,
      legTuck: 15,
    };
    delete profile.acftScores.plank;

    const result = calculateOML(profile, config, tables);

    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.pillarScores.physical).toBeGreaterThan(0);
  });

  test('invalid input: GPA = 5.0 throws ValidationError', () => {
    const profile = makeFullProfile();
    profile.gpa = 5.0;

    expect(() => calculateOML(profile, config, tables)).toThrow(ValidationError);
    expect(() => calculateOML(profile, config, tables)).toThrow(/gpa must be between/);
  });

  test('invalid input: negative extracurricular hours throws ValidationError', () => {
    const profile = makeFullProfile();
    profile.extracurricularHours = -10;

    expect(() => calculateOML(profile, config, tables)).toThrow(ValidationError);
  });

  test('invalid input: leadershipEval = 150 throws ValidationError', () => {
    const profile = makeFullProfile();
    profile.leadershipEval = 150;

    expect(() => calculateOML(profile, config, tables)).toThrow(ValidationError);
  });

  test('malformed ACFT tables throw ACFTTablesError', () => {
    const profile = makeFullProfile();

    expect(() => calculateOML(profile, config, null as unknown as ACFTTables)).toThrow(
      ACFTTablesError
    );

    expect(() =>
      calculateOML(profile, config, {} as ACFTTables)
    ).toThrow(ACFTTablesError);

    expect(() =>
      calculateOML(profile, config, { events: {} } as unknown as ACFTTables)
    ).toThrow(ACFTTablesError);
  });

  test('marginal gains: improving ACFT changes OML by expected amount', () => {
    const profile = makeFullProfile();
    const result = calculateOML(profile, config, tables);

    // Should have ACFT-related marginal gains
    const acftGains = Object.keys(result.marginalGains).filter((k) =>
      k.startsWith('acft.')
    );
    expect(acftGains.length).toBeGreaterThan(0);

    // Each marginal gain should be non-negative (improvement should help or be neutral)
    for (const key of acftGains) {
      expect(result.marginalGains[key]).toBeGreaterThanOrEqual(0);
    }

    // GPA gain should also exist
    expect(result.marginalGains['gpa+0.1']).toBeDefined();
    expect(result.marginalGains['gpa+0.1']).toBeGreaterThan(0);
  });

  test('marginal gains: GPA at max (4.0) does not include gpa+0.1', () => {
    const profile = makeMaxProfile();
    const result = calculateOML(profile, config, tables);

    expect(result.marginalGains['gpa+0.1']).toBeUndefined();
  });
});

describe('calculateACFTTotal', () => {
  test('returns correct total for known scores', () => {
    const scores = {
      deadlift: 300,
      powerThrow: 10.0,
      pushUps: 50,
      sprintDragCarry: 100,
      plank: 200,
      twoMileRun: 830,
    };

    const total = calculateACFTTotal(scores, 'M', '17-21', tables);

    // Each event should score in the 90s range for these good scores
    expect(total).toBeGreaterThan(400);
    expect(total).toBeLessThanOrEqual(600);
  });

  test('handles missing event scores gracefully', () => {
    const scores = { deadlift: 200 };
    const total = calculateACFTTotal(scores, 'M', '17-21', tables);

    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(200);
  });
});

describe('validateProfile', () => {
  test('valid profile passes', () => {
    expect(() => validateProfile(makeFullProfile(), config)).not.toThrow();
  });

  test('invalid yearGroup throws', () => {
    const profile = makeFullProfile();
    (profile as any).yearGroup = 'MSV';
    expect(() => validateProfile(profile, config)).toThrow(ValidationError);
  });

  test('invalid gender throws', () => {
    const profile = makeFullProfile();
    (profile as any).gender = 'X';
    expect(() => validateProfile(profile, config)).toThrow(ValidationError);
  });

  test('too many command roles throws', () => {
    const profile = makeFullProfile();
    profile.commandRoles = new Array(25).fill('Role');
    expect(() => validateProfile(profile, config)).toThrow(ValidationError);
  });
});
