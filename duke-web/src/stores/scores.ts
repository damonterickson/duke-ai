/**
 * Zustand store — Score History & ACFT Assessments
 *
 * Web: localStorage for persistence via storage service.
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
    } catch (error) {
      console.error('Failed to insert ACFT assessment:', error);
    }
  },

  reset: () => {
    set({ scoreHistory: [], acftAssessments: [], isLoaded: false });
  },
}));
