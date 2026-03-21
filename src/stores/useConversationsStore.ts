import { create } from 'zustand';
import { ChatMessage } from '../components/VChatSheet';
import { saveConversation, getConversations } from '../services/storage';

interface ConversationsState {
  activeConversationId: string | null;
  messages: ChatMessage[];
  loaded: boolean;

  loadFromSQLite: () => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  startNewConversation: () => void;
  persistConversation: () => Promise<void>;
}

export const useConversationsStore = create<ConversationsState>((set, get) => ({
  activeConversationId: null,
  messages: [],
  loaded: false,

  loadFromSQLite: async () => {
    try {
      const rows = await getConversations();
      if (rows.length > 0) {
        const latest = rows[0];
        set({
          activeConversationId: latest.id,
          messages: JSON.parse(latest.messages_json),
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
    } catch (e) {
      console.warn('Failed to load conversations:', e);
      set({ loaded: true });
    }
  },

  addMessage: (message) => {
    set((s) => {
      const convId = s.activeConversationId || `conv_${Date.now()}`;
      return {
        activeConversationId: convId,
        messages: [...s.messages, message],
      };
    });
  },

  updateLastAssistantMessage: (content) => {
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          msgs[i] = { ...msgs[i], content };
          break;
        }
      }
      return { messages: msgs };
    });
  },

  startNewConversation: () => {
    set({
      activeConversationId: `conv_${Date.now()}`,
      messages: [],
    });
  },

  persistConversation: async () => {
    const { activeConversationId, messages } = get();
    if (!activeConversationId || messages.length === 0) return;
    try {
      await saveConversation(activeConversationId, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to persist conversation:', e);
    }
  },
}));
