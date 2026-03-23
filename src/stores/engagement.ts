/**
 * Zustand store — Engagement & Gamification
 *
 * Tracks streaks, XP, tier, badges, and missions.
 * Persists to AsyncStorage under @duke_engagement.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncAchievement } from '../services/supabase';

const STORAGE_KEY = '@duke_engagement';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Mission {
  id: string;
  title: string;
  location: string;
  description: string;
  targetMetric: string;
  omlImpact: number;
  acceptedAt: string | null;
  completedAt: string | null;
  xpReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  criteria: { metric: string; threshold: number; comparator: '>=' | '>' | '<=' | '<' };
}

export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Vanguard Elite';

// ---------------------------------------------------------------------------
// Predefined badges
// ---------------------------------------------------------------------------

export const BADGES: Badge[] = [
  {
    id: 'iron_vanguard',
    name: 'Iron Vanguard',
    description: '300+ ACFT Score',
    icon: 'fitness-center',
    unlockedAt: null,
    criteria: { metric: 'acft_total', threshold: 300, comparator: '>=' },
  },
  {
    id: 'deans_list',
    name: "Dean's List",
    description: '3.8+ GPA',
    icon: 'school',
    unlockedAt: null,
    criteria: { metric: 'gpa', threshold: 3.8, comparator: '>=' },
  },
  {
    id: 'cst_ready',
    name: 'CST Ready',
    description: 'All evaluations complete',
    icon: 'verified',
    unlockedAt: null,
    criteria: { metric: 'evals_complete', threshold: 1, comparator: '>=' },
  },
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface EngagementState {
  streak: number;
  lastActiveDate: string | null;
  xpTotal: number;
  tier: Tier;
  branchFit: Array<{ branch: string; percentage: number }>;
  activeMission: Mission | null;
  completedMissions: Mission[];
  badges: Badge[];

  // Actions
  hydrate: () => Promise<void>;
  updateStreak: () => void;
  unlockBadge: (badgeId: string) => void;
  acceptMission: (mission: Mission) => void;
  completeMission: (missionId: string) => void;
  saveToStorage: () => Promise<void>;
}

const initialState = {
  streak: 0,
  lastActiveDate: null as string | null,
  xpTotal: 0,
  tier: 'Bronze' as Tier,
  branchFit: [] as Array<{ branch: string; percentage: number }>,
  activeMission: null as Mission | null,
  completedMissions: [] as Mission[],
  badges: BADGES.map((b) => ({ ...b })),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return today's date as YYYY-MM-DD in UTC. */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Return yesterday's date as YYYY-MM-DD in UTC. */
function yesterdayUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useEngagementStore = create<EngagementState>((set, get) => ({
  ...initialState,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);

        // Validate lastActiveDate — if it's in the future, reset streak
        let streak = parsed.streak ?? 0;
        let lastActiveDate = parsed.lastActiveDate ?? null;
        if (lastActiveDate && lastActiveDate > todayUTC()) {
          streak = 0;
          lastActiveDate = null;
        }

        set({
          streak,
          lastActiveDate,
          xpTotal: parsed.xpTotal ?? 0,
          tier: parsed.tier ?? 'Bronze',
          branchFit: parsed.branchFit ?? [],
          activeMission: parsed.activeMission ?? null,
          completedMissions: parsed.completedMissions ?? [],
          badges: parsed.badges ?? BADGES.map((b) => ({ ...b })),
        });
      }
    } catch (error) {
      console.error('Failed to hydrate engagement store:', error);
    }
  },

  updateStreak: () => {
    const { lastActiveDate, streak } = get();
    const today = todayUTC();

    if (lastActiveDate === today) {
      // Already active today — no change
      return;
    }

    if (lastActiveDate === yesterdayUTC()) {
      // Consecutive day — increment streak
      set({ streak: streak + 1, lastActiveDate: today });
    } else {
      // Gap — reset streak to 1 (today counts)
      set({ streak: 1, lastActiveDate: today });
    }

    get().saveToStorage();
  },

  unlockBadge: (badgeId: string) => {
    const { badges } = get();
    const badge = badges.find((b) => b.id === badgeId);
    const updated = badges.map((b) =>
      b.id === badgeId && !b.unlockedAt
        ? { ...b, unlockedAt: new Date().toISOString() }
        : b,
    );
    set({ badges: updated });
    get().saveToStorage();

    // Sync badge unlock to squad mates via Supabase
    if (badge && !badge.unlockedAt) {
      syncAchievement({
        type: 'badge_unlock',
        title: badge.name,
        description: badge.description,
      }).catch(() => {}); // fire-and-forget, errors logged in supabase.ts
    }
  },

  acceptMission: (mission: Mission) => {
    set({
      activeMission: { ...mission, acceptedAt: new Date().toISOString() },
    });
    get().saveToStorage();
  },

  completeMission: (missionId: string) => {
    const { activeMission, completedMissions, xpTotal } = get();
    if (!activeMission || activeMission.id !== missionId) return;

    const completed: Mission = {
      ...activeMission,
      completedAt: new Date().toISOString(),
    };

    set({
      activeMission: null,
      completedMissions: [...completedMissions, completed],
      xpTotal: xpTotal + completed.xpReward,
    });
    get().saveToStorage();

    // Sync mission completion to squad mates via Supabase
    syncAchievement({
      type: 'mission_complete',
      title: completed.title,
      description: completed.description,
    }).catch(() => {}); // fire-and-forget, errors logged in supabase.ts
  },

  saveToStorage: async () => {
    try {
      const {
        streak,
        lastActiveDate,
        xpTotal,
        tier,
        branchFit,
        activeMission,
        completedMissions,
        badges,
      } = get();

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          streak,
          lastActiveDate,
          xpTotal,
          tier,
          branchFit,
          activeMission,
          completedMissions,
          badges,
        }),
      );
    } catch (error) {
      console.error('Failed to save engagement store:', error);
    }
  },
}));
