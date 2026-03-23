/**
 * Zustand store — AI Chat Conversations
 *
 * Native: SQLite for persistence (read on start, write-through on update).
 * Web: AsyncStorage fallback (SQLite unavailable).
 */

import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getConversations,
  insertConversation,
  clearConversations,
  type ConversationRow,
} from '../services/storage';

const ASYNC_KEY = '@duke_conversations';
const isWeb = Platform.OS === 'web';

export interface ConversationsState {
  messages: ConversationRow[];
  isLoaded: boolean;

  // Actions
  loadFromSQLite: () => Promise<void>;
  addMessage: (role: string, content: string) => Promise<void>;
  clearAll: () => Promise<void>;
  reset: () => void;
}

export const useConversationsStore = create<ConversationsState>((set, get) => ({
  messages: [],
  isLoaded: false,

  loadFromSQLite: async () => {
    try {
      if (isWeb) {
        const stored = await AsyncStorage.getItem(ASYNC_KEY);
        set({
          messages: stored ? JSON.parse(stored) : [],
          isLoaded: true,
        });
        return;
      }

      const rows = await getConversations();
      set({ messages: rows, isLoaded: true });
    } catch (error) {
      console.error('Failed to load conversations:', error);
      set({ isLoaded: true });
    }
  },

  addMessage: async (role, content) => {
    try {
      if (isWeb) {
        const newRow: ConversationRow = { id: Date.now(), role, content };
        set((state) => {
          const updated = [...state.messages, newRow];
          AsyncStorage.setItem(ASYNC_KEY, JSON.stringify(updated)).catch((e) =>
            console.error('Failed to persist conversations to AsyncStorage:', e)
          );
          return { messages: updated };
        });
        return;
      }

      const id = await insertConversation({ role, content });
      const newRow: ConversationRow = { id, role, content };
      set((state) => ({
        messages: [...state.messages, newRow],
      }));
    } catch (error) {
      console.error('Failed to insert conversation:', error);
    }
  },

  clearAll: async () => {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(ASYNC_KEY);
        set({ messages: [] });
        return;
      }

      await clearConversations();
      set({ messages: [] });
    } catch (error) {
      console.error('Failed to clear conversations:', error);
    }
  },

  reset: () => {
    set({ messages: [], isLoaded: false });
  },
}));
