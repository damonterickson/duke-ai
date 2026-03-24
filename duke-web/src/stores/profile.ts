/**
 * Zustand store — Cadet Profile
 *
 * Web: localStorage for persistence via storage service.
 */

import { create } from 'zustand';
import {
  getProfile,
  upsertProfile,
  type CadetProfileRow,
} from '../services/storage';

export interface ProfileState {
  id: number | null;
  name: string | null;
  photoUri: string | null;
  yearGroup: 'MSI' | 'MSII' | 'MSIII' | 'MSIV' | null;
  gender: 'M' | 'F' | null;
  ageBracket: '17-21' | '22-26' | '27-31' | null;
  targetBranch: string | null;
  goalOml: number | null;
  isLoaded: boolean;

  // Actions
  loadFromSQLite: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<ProfileState, 'name' | 'photoUri' | 'yearGroup' | 'gender' | 'ageBracket' | 'targetBranch' | 'goalOml'>>) => Promise<void>;
  reset: () => void;
}

const initialState = {
  id: null as number | null,
  name: null as string | null,
  photoUri: null as string | null,
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
          name: row.name ?? null,
          photoUri: row.photo_uri ?? null,
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
      console.error('Failed to load profile:', error);
      set({ isLoaded: true });
    }
  },

  updateProfile: async (updates) => {
    // Optimistic: update Zustand immediately
    set(updates);

    const state = get();
    if (!state.yearGroup) return;

    try {
      const newId = await upsertProfile({
        year_group: state.yearGroup,
        gender: state.gender ?? 'M',
        age_bracket: state.ageBracket ?? '17-21',
        target_branch: state.targetBranch,
        goal_oml: state.goalOml,
        name: state.name,
        photo_uri: state.photoUri,
      });
      set({ id: newId });
    } catch (error) {
      console.error('Failed to persist profile:', error);
    }
  },

  reset: () => {
    set(initialState);
  },
}));
