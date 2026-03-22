/**
 * Zustand store — Goals
 *
 * On app start: loadFromSQLite() reads goals table -> sets Zustand state.
 * On update: Zustand state updates immediately, then writes through to SQLite.
 */

import { create } from 'zustand';
import {
  getGoals,
  insertGoal,
  updateGoal,
  deleteGoal,
  insertGoalProgress,
  type GoalRow,
} from '../services/storage';

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

export const useGoalsStore = create<GoalsState>((set, get) => ({
  ...initialState,

  loadFromSQLite: async () => {
    try {
      const rows = await getGoals();
      set({
        goals: rows,
        isLoaded: true,
      });
    } catch (error) {
      console.error('Failed to load goals from SQLite:', error);
      set({ isLoaded: true });
    }
  },

  addGoal: async (goal) => {
    try {
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
