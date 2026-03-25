/**
 * Zustand store — Score History & ACFT Assessments
 *
 * Web: localStorage for persistence via storage service.
 * Auto-syncs goal progress when scores are saved.
 */

import { create } from 'zustand';
import {
  getScoreHistory,
  insertScoreHistory,
  getACFTAssessments,
  insertACFTAssessment,
  type ScoreHistoryRow,
  type ACFTAssessmentRow,
} from '../services/storage';
import { syncGoalsWithScores } from '../services/goalSync';
import { useGoalsStore } from './goals';

export interface ScoresState {
  scoreHistory: ScoreHistoryRow[];
  acftAssessments: ACFTAssessmentRow[];
  isLoaded: boolean;

  // Actions
  loadFromSQLite: () => Promise<void>;
  addScoreEntry: (entry: Omit<ScoreHistoryRow, 'id' | 'recorded_at'>) => Promise<void>;
  addACFTAssessment: (entry: Omit<ACFTAssessmentRow, 'id' | 'recorded_at'>) => Promise<void>;
  reset: () => void;
}

export const useScoresStore = create<ScoresState>((set) => ({
  scoreHistory: [],
  acftAssessments: [],
  isLoaded: false,

  loadFromSQLite: async () => {
    try {
      const [scores, acft] = await Promise.all([
        getScoreHistory(),
        getACFTAssessments(),
      ]);
      set({
        scoreHistory: scores,
        acftAssessments: acft,
        isLoaded: true,
      });
    } catch (error) {
      console.error('Failed to load scores:', error);
      set({ isLoaded: true });
    }
  },

  addScoreEntry: async (entry) => {
    try {
      const id = await insertScoreHistory(entry);
      const newRow: ScoreHistoryRow = { ...entry, id };
      set((state) => ({
        scoreHistory: [newRow, ...state.scoreHistory],
      }));

      // Auto-sync goal progress
      try {
        const goalsState = useGoalsStore.getState();
        const activeGoals = goalsState.goals.filter((g) => g.status === 'active');
        if (activeGoals.length > 0) {
          const { updated } = syncGoalsWithScores(activeGoals, newRow);
          for (const update of updated) {
            if (update.completed) {
              await goalsState.completeGoal(update.goalId);
            } else {
              await goalsState.updateGoalProgress(update.goalId, update.newValue);
            }
          }
        }
      } catch (syncError) {
        console.warn('Goal sync failed (non-blocking):', syncError);
      }
    } catch (error) {
      console.error('Failed to insert score history:', error);
    }
  },

  addACFTAssessment: async (entry) => {
    try {
      const id = await insertACFTAssessment(entry);
      const newRow: ACFTAssessmentRow = { ...entry, id };
      set((state) => ({
        acftAssessments: [newRow, ...state.acftAssessments],
      }));

      // Auto-sync goals for ACFT total
      if (entry.total) {
        try {
          const goalsState = useGoalsStore.getState();
          const activeGoals = goalsState.goals.filter((g) => g.status === 'active');
          const acftGoals = activeGoals.filter((g) => g.metric === 'acft_total');
          for (const goal of acftGoals) {
            if (entry.total >= goal.target_value) {
              await goalsState.completeGoal(goal.id!);
            } else {
              await goalsState.updateGoalProgress(goal.id!, entry.total);
            }
          }
        } catch (syncError) {
          console.warn('Goal sync failed (non-blocking):', syncError);
        }
      }
    } catch (error) {
      console.error('Failed to insert ACFT assessment:', error);
    }
  },

  reset: () => {
    set({ scoreHistory: [], acftAssessments: [], isLoaded: false });
  },
}));
