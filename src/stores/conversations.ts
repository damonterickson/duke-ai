/**
 * Zustand store — AI Chat Conversations
 *
 * Manual SQLite hydration pattern.
 */

import { create } from 'zustand';
import {
  getConversations,
  insertConversation,
  clearConversations,
  type ConversationRow,
} from '../services/storage';

export interface ConversationsState {
  messages: ConversationRow[];
  isLoaded: boolean;

  // Actions
  loadFromSQLite: () => Promise<void>;
  addMessage: (role: string, content: string) => Promise<void>;
  clearAll: () => Promise<void>;
  reset: () => void;
}

export const useConversationsStore = create<ConversationsState>((set) => ({
  messages: [],
  isLoaded: false,

  loadFromSQLite: async () => {
    try {
      const rows = await getConversations();
      set({ messages: rows, isLoaded: true });
    } catch (error) {
      console.error('Failed to load conversations from SQLite:', error);
      set({ isLoaded: true });
    }
  },

  addMessage: async (role, content) => {
    try {
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
