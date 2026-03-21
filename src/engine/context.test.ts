import { buildContext, type ConversationTurn, type TrendEntry } from './context';
import type { CadetProfile, OMLResult } from './oml';

// ─── Fixtures ────────────────────────────────────────────────────────

function makeProfile(): CadetProfile {
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

function makeOMLResult(): OMLResult {
  return {
    totalScore: 750,
    pillarScores: { academic: 300, leadership: 280, physical: 170 },
    marginalGains: {
      'gpa+0.1': 6.0,
      'mslGpa+0.1': 4.0,
      'leadershipEval+5': 7.0,
      'acft.deadlift+10': 1.5,
      'acft.twoMileRun-5': 2.0,
    },
  };
}

function makeMinimalProfile(): CadetProfile {
  return {
    gpa: 2.0,
    mslGpa: 2.0,
    acftScores: { deadlift: 140 },
    leadershipEval: 0,
    commandRoles: [],
    extracurricularHours: 0,
    yearGroup: 'MSI',
    gender: 'M',
    ageBracket: '17-21',
  };
}

function makeMinimalOMLResult(): OMLResult {
  return {
    totalScore: 250,
    pillarScores: { academic: 200, leadership: 0, physical: 50 },
    marginalGains: { 'gpa+0.1': 6.0 },
  };
}

// ─── Tests ───────────────────────────────────────────────────────────

describe('buildContext', () => {
  test('happy path: full profile returns valid JSON within token budget', () => {
    const output = buildContext(makeProfile(), makeOMLResult(), []);
    const parsed = JSON.parse(output);

    expect(parsed).toHaveProperty('profile');
    expect(parsed).toHaveProperty('oml');
    expect(parsed).toHaveProperty('topGains');
    expect(parsed).toHaveProperty('recentConversation');
    expect(parsed.oml.totalScore).toBe(750);

    // Token budget: ~800 tokens => ~3200 chars
    expect(output.length).toBeLessThanOrEqual(3200);
  });

  test('minimal profile produces valid but sparse JSON', () => {
    const output = buildContext(makeMinimalProfile(), makeMinimalOMLResult(), []);
    const parsed = JSON.parse(output);

    expect(parsed.profile.yearGroup).toBe('MSI');
    expect(parsed.profile.gpa).toBe(2.0);
    expect(parsed.oml.totalScore).toBe(250);
    expect(parsed.recentConversation).toEqual([]);

    expect(output.length).toBeLessThanOrEqual(3200);
  });

  test('includes conversation history (up to 5 turns)', () => {
    const history: ConversationTurn[] = [
      { role: 'user', content: 'How do I improve my OML?', timestamp: 1000 },
      { role: 'assistant', content: 'Focus on GPA and ACFT.', timestamp: 2000 },
      { role: 'user', content: 'What about leadership?', timestamp: 3000 },
    ];

    const output = buildContext(makeProfile(), makeOMLResult(), history);
    const parsed = JSON.parse(output);

    expect(parsed.recentConversation).toHaveLength(3);
    expect(parsed.recentConversation[0].role).toBe('user');
  });

  test('long conversation history is truncated to fit token budget', () => {
    // Create 20 long conversation turns
    const history: ConversationTurn[] = [];
    for (let i = 0; i < 20; i++) {
      history.push({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `This is a moderately long message number ${i} that contains some detail about the conversation topic and OML optimization strategies for cadets.`,
        timestamp: i * 1000,
      });
    }

    const output = buildContext(makeProfile(), makeOMLResult(), history);
    const parsed = JSON.parse(output);

    // Should have trimmed conversation turns
    expect(parsed.recentConversation.length).toBeLessThan(20);

    // Should still be valid JSON within budget
    expect(output.length).toBeLessThanOrEqual(3200);
  });

  test('includes trend data when provided', () => {
    const trends: TrendEntry[] = [
      {
        totalScore: 700,
        pillarScores: { academic: 280, leadership: 260, physical: 160 },
        recordedAt: Date.now() - 60 * 86400000,
      },
      {
        totalScore: 730,
        pillarScores: { academic: 290, leadership: 270, physical: 170 },
        recordedAt: Date.now() - 30 * 86400000,
      },
      {
        totalScore: 750,
        pillarScores: { academic: 300, leadership: 280, physical: 170 },
        recordedAt: Date.now(),
      },
    ];

    const output = buildContext(makeProfile(), makeOMLResult(), [], trends);
    const parsed = JSON.parse(output);

    expect(parsed.trend).toBeDefined();
    expect(parsed.trend.direction).toBe('improving');
    expect(parsed.trend.entries.length).toBeLessThanOrEqual(3);
  });

  test('includes pillar deltas when trend has at least 2 entries', () => {
    const trends: TrendEntry[] = [
      {
        totalScore: 700,
        pillarScores: { academic: 280, leadership: 260, physical: 160 },
        recordedAt: Date.now() - 30 * 86400000,
      },
      {
        totalScore: 750,
        pillarScores: { academic: 300, leadership: 280, physical: 170 },
        recordedAt: Date.now(),
      },
    ];

    const output = buildContext(makeProfile(), makeOMLResult(), [], trends);
    const parsed = JSON.parse(output);

    expect(parsed.pillarDeltas).toBeDefined();
    expect(parsed.pillarDeltas.total).toBe(50);
    expect(parsed.pillarDeltas.academic).toBe(20);
  });

  test('top gains are sorted by impact descending', () => {
    const output = buildContext(makeProfile(), makeOMLResult(), []);
    const parsed = JSON.parse(output);

    expect(parsed.topGains.length).toBeGreaterThan(0);
    expect(parsed.topGains.length).toBeLessThanOrEqual(3);

    for (let i = 1; i < parsed.topGains.length; i++) {
      expect(parsed.topGains[i - 1].impact).toBeGreaterThanOrEqual(
        parsed.topGains[i].impact
      );
    }
  });

  test('output is always valid JSON', () => {
    // Even with edge-case data
    const profile = makeMinimalProfile();
    profile.commandRoles = [];

    const result = makeMinimalOMLResult();
    result.marginalGains = {};

    const output = buildContext(profile, result, []);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  test('token budget: output stays under ~800 tokens', () => {
    // Worst case: full data + long history + trends
    const history: ConversationTurn[] = [];
    for (let i = 0; i < 50; i++) {
      history.push({
        role: 'user',
        content: `A very long message about OML optimization strategies and how to improve physical fitness scores and academic GPA simultaneously while maintaining leadership roles number ${i}.`,
        timestamp: i * 1000,
      });
    }

    const trends: TrendEntry[] = [];
    for (let i = 0; i < 10; i++) {
      trends.push({
        totalScore: 600 + i * 10,
        pillarScores: { academic: 240 + i * 4, leadership: 220 + i * 4, physical: 140 + i * 2 },
        recordedAt: Date.now() - (10 - i) * 30 * 86400000,
      });
    }

    const output = buildContext(makeProfile(), makeOMLResult(), history, trends);

    // ~800 tokens * 4 chars/token = 3200 chars
    expect(output.length).toBeLessThanOrEqual(3200);
  });
});
