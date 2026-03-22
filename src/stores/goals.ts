/**
 * Zustand store — Goals
 *
 * Native: SQLite for persistence (read on start, write-through on update).
 * Web: AsyncStorage fallback (SQLite unavailable).
 */

import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getGoals,
  insertGoal,
  updateGoal,
  deleteGoal,
  insertGoalProgress,
  type GoalRow,
} from '../services/storage';

const ASYNC_KEY = '@duke_goals';
const isWeb = Platform.OS === 'web';

export interface GoalsState {
  goals: GoalRow[];
  isLoaded: boolean;

  // Actions
  loadFromSQLite: () => Promise<void>;
  addGoal: (goal: Omit<GoalRow, 'id' | 'created_at'>) => Promise<number | null>;
  updateGoalProgress: (goalId: number, newValue: number) => Promise<void>;
  completeGoal: (goalId: number) => Promise<void>;
  removeGoal: (goalId: number) => Promise<void>;
  getActiveGoals: () => GoalRow[];
  reset: () => void;
}

const initialState = {
  goals: [] as GoalRow[],
  isLoaded: false,
};

/** Helper: persist the full goals array to AsyncStorage (web only). */
const persistGoalsAsync = (goals: GoalRow[]) => {
  AsyncStorage.setItem(ASYNC_KEY, JSON.stringify(goals)).catch((e) =>
    console.error('Failed to persist goals to AsyncStorage:', e)
  );
};

export const useGoalsStore = create<GoalsState>((set, get) => ({
  ...initialState,

  loadFromSQLite: async () => {
    try {
      if (isWeb) {
        const stored = await AsyncStorage.getItem(ASYNC_KEY);
        set({
          goals: stored ? JSON.parse(stored) : [],
          isLoaded: true,
        });
        return;
      }

      const rows = await getGoals();
      set({
        goals: rows,
        isLoaded: true,
      });
    } catch (error) {
      console.error('Failed to load goals:', error);
      set({ isLoaded: true });
    }
  },

  addGoal: async (goal) => {
    try {
      const activeCount = get().goals.filter((g) => g.status === 'active').length;
      if (activeCount >= 5) {
        console.warn('Cannot add goal: active goal cap (5) reached');
        return null;
      }

      if (isWeb) {
        const id = Date.now();
        const newRow: GoalRow = { ...goal, id };
        set((state) => {
          const updated = [newRow, ...state.goals];
          persistGoalsAsync(updated);
          return { goals: updated };
        });
        return id;
      }

      const id = await insertGoal(goal);
      const newRow: GoalRow = { ...goal, id };
      set((state) => ({
        goals: [newRow, ...state.goals],
      }));
      return id;
    } catch (error) {
      console.error('Failed to insert goal:', error);
      return null;
    }
  },

  updateGoalProgress: async (goalId, newValue) => {
    try {
      if (isWeb) {
        set((state) => {
          const updated = state.goals.map((g) =>
            g.id === goalId ? { ...g, current_value: newValue } : g
          );
          persistGoalsAsync(updated);
          return { goals: updated };
        });
        return;
      }

      await updateGoal(goalId, { current_value: newValue });
      await insertGoalProgress(goalId, newValue);
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId ? { ...g, current_value: newValue } : g
        ),
      }));
    } catch (error) {
      console.error('Failed to update goal progress:', error);
    }
  },

  completeGoal: async (goalId) => {
    try {
      const completedAt = new Date().toISOString();

      if (isWeb) {
        set((state) => {
          const updated = state.goals.map((g) =>
            g.id === goalId ? { ...g, status: 'completed', completed_at: completedAt } : g
          );
          persistGoalsAsync(updated);
          return { goals: updated };
        });
        return;
      }

      await updateGoal(goalId, { status: 'completed', completed_at: completedAt });
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId ? { ...g, status: 'completed', completed_at: completedAt } : g
        ),
      }));
    } catch (error) {
      console.error('Failed to complete goal:', error);
    }
  },

  removeGoal: async (goalId) => {
    try {
      if (isWeb) {
        set((state) => {
          const updated = state.goals.filter((g) => g.id !== goalId);
          persistGoalsAsync(updated);
          return { goals: updated };
        });
        return;
      }

      await deleteGoal(goalId);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== goalId),
      }));
    } catch (error) {
      console.error('Failed to remove goal:', error);
    }
  },

  getActiveGoals: () => {
    return get().goals.filter((g) => g.status === 'active');
  },

  reset: () => {
    set(initialState);
  },
}));
