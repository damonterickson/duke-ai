/**
 * Zustand store — Squad Rankings (local mock data for v1)
 *
 * Persists to localStorage under duke_squad.
 */

import { create } from 'zustand';

const STORAGE_KEY = 'duke_squad';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface SquadState {
  squadName: string;
  squadRank: number;
  totalSquads: number;
  individualRank: number;
  totalCadets: number;
  weeklyRankHistory: number[];
  isLoaded: boolean;

  // Actions
  hydrate: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const initialState = {
  squadName: 'Bravo Company',
  squadRank: 1,
  totalSquads: 4,
  individualRank: 4,
  totalCadets: 142,
  weeklyRankHistory: [8, 6, 7, 5, 4],
  isLoaded: false,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSquadStore = create<SquadState>((set, get) => ({
  ...initialState,

  hydrate: async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          squadName: parsed.squadName ?? initialState.squadName,
          squadRank: parsed.squadRank ?? initialState.squadRank,
          totalSquads: parsed.totalSquads ?? initialState.totalSquads,
          individualRank: parsed.individualRank ?? initialState.individualRank,
          totalCadets: parsed.totalCadets ?? initialState.totalCadets,
          weeklyRankHistory: parsed.weeklyRankHistory ?? initialState.weeklyRankHistory,
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Failed to hydrate squad store:', error);
      set({ isLoaded: true });
    }
  },

  saveToStorage: async () => {
    try {
      const {
        squadName, squadRank, totalSquads,
        individualRank, totalCadets, weeklyRankHistory,
      } = get();

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          squadName, squadRank, totalSquads,
          individualRank, totalCadets, weeklyRankHistory,
        }),
      );
    } catch (error) {
      console.error('Failed to save squad store:', error);
    }
  },
}));
