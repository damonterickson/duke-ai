/**
 * Zustand store — Score History & ACFT Assessments
 *
 * Native: SQLite for persistence (read on start, write-through on update).
 * Web: AsyncStorage fallback (SQLite unavailable).
 */

import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getScoreHistory,
  insertScoreHistory,
  getACFTAssessments,
  insertACFTAssessment,
  type ScoreHistoryRow,
  type ACFTAssessmentRow,
} from '../services/storage';

const ASYNC_KEY_SCORES = '@duke_scores';
const ASYNC_KEY_ACFT = '@duke_acft_assessments';
const isWeb = Platform.OS === 'web';

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

export const useScoresStore = create<ScoresState>((set, get) => ({
  scoreHistory: [],
  acftAssessments: [],
  isLoaded: false,

  loadFromSQLite: async () => {
    try {
      if (isWeb) {
        const [scoresJson, acftJson] = await Promise.all([
          AsyncStorage.getItem(ASYNC_KEY_SCORES),
          AsyncStorage.getItem(ASYNC_KEY_ACFT),
        ]);
        set({
          scoreHistory: scoresJson ? JSON.parse(scoresJson) : [],
          acftAssessments: acftJson ? JSON.parse(acftJson) : [],
          isLoaded: true,
        });
        return;
      }

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
      if (isWeb) {
        const newRow: ScoreHistoryRow = { ...entry, id: Date.now() };
        set((state) => {
          const updated = [newRow, ...state.scoreHistory];
          AsyncStorage.setItem(ASYNC_KEY_SCORES, JSON.stringify(updated)).catch((e) =>
            console.error('Failed to persist scores to AsyncStorage:', e)
          );
          return { scoreHistory: updated };
        });
        return;
      }

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
      if (isWeb) {
        const newRow: ACFTAssessmentRow = { ...entry, id: Date.now() };
        set((state) => {
          const updated = [newRow, ...state.acftAssessments];
          AsyncStorage.setItem(ASYNC_KEY_ACFT, JSON.stringify(updated)).catch((e) =>
            console.error('Failed to persist ACFT assessments to AsyncStorage:', e)
          );
          return { acftAssessments: updated };
        });
        return;
      }

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
