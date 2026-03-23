/**
 * Zustand store — Cadet Profile
 *
 * Native: SQLite for persistence (read on start, write-through on update).
 * Web: AsyncStorage fallback (SQLite unavailable).
 */

import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getProfile,
  upsertProfile,
  type CadetProfileRow,
} from '../services/storage';

const ASYNC_KEY = '@duke_profile';
const isWeb = Platform.OS === 'web';

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
      if (isWeb) {
        // Web: load from AsyncStorage
        const stored = await AsyncStorage.getItem(ASYNC_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          set({ ...data, isLoaded: true });
        } else {
          set({ isLoaded: true });
        }
        return;
      }

      // Native: load from SQLite
      const row = await getProfile();
      if (row) {
        set({
          id: row.id ?? null,
          name: (row as any).name ?? null,
          photoUri: (row as any).photo_uri ?? null,
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

    if (isWeb) {
      // Web: persist to AsyncStorage
      try {
        const { isLoaded: _, loadFromSQLite: _l, updateProfile: _u, reset: _r, ...data } = state;
        await AsyncStorage.setItem(ASYNC_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to persist profile to AsyncStorage:', error);
      }
      return;
    }

    // Native: persist to SQLite
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
      console.error('Failed to persist profile to SQLite:', error);
    }
  },

  reset: () => {
    set(initialState);
  },
}));
