/**
 * Zustand store — Cadet Profile
 *
 * On app start: loadFromSQLite() reads profile table -> sets Zustand state.
 * On update: Zustand state updates immediately, then writes through to SQLite.
 */

import { create } from 'zustand';
import {
  getProfile,
  upsertProfile,
  type CadetProfileRow,
} from '../services/storage';

export interface ProfileState {
  id: number | null;
  yearGroup: 'MSI' | 'MSII' | 'MSIII' | 'MSIV' | null;
  gender: 'M' | 'F' | null;
  ageBracket: '17-21' | '22-26' | '27-31' | null;
  targetBranch: string | null;
  goalOml: number | null;
  isLoaded: boolean;

  // Actions
  loadFromSQLite: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<ProfileState, 'yearGroup' | 'gender' | 'ageBracket' | 'targetBranch' | 'goalOml'>>) => Promise<void>;
  reset: () => void;
}

const initialState = {
  id: null as number | null,
  yearGroup: null as ProfileState['yearGroup'],
  gender: null as ProfileState['gender'],
  ageBracket: null as ProfileState['ageBracket'],
  targetBranch: null as string | null,
  goalOml: null as number | null,
  isLoaded: false,
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  ...initialState,

  loadFromSQLite: async () => {
    try {
      const row = await getProfile();
      if (row) {
        set({
          id: row.id ?? null,
          yearGroup: row.year_group as ProfileState['yearGroup'],
          gender: row.gender as ProfileState['gender'],
          ageBracket: row.age_bracket as ProfileState['ageBracket'],
          targetBranch: row.target_branch ?? null,
          goalOml: row.goal_oml ?? null,
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Failed to load profile from SQLite:', error);
      set({ isLoaded: true });
    }
  },

  updateProfile: async (updates) => {
    // Optimistic: update Zustand immediately
    set(updates);

    // Write through to SQLite — need at least yearGroup to write
    const state = get();
    if (!state.yearGroup) return;

    try {
      const newId = await upsertProfile({
        year_group: state.yearGroup,
        gender: state.gender ?? 'M',
        age_bracket: state.ageBracket ?? '17-21',
        target_branch: state.targetBranch,
        goal_oml: state.goalOml,
      });
      set({ id: newId });
    } catch (error) {
      console.error('Failed to persist profile to SQLite:', error);
    }
  },

  reset: () => {
    set(initialState);
  },
}));
