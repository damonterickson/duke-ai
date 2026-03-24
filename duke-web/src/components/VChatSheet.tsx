'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MdClose, MdSend } from 'react-icons/md';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export interface VChatSheetProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  visible?: boolean;
  onClose?: () => void;
  loading?: boolean;
  className?: string;
}

export const VChatSheet: React.FC<VChatSheetProps> = ({
  messages,
  onSend,
  visible = true,
  onClose,
  loading = false,
  className = '',
}) => {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!visible) return null;

  const handleSend = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) return;
    onSend(trimmed);
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-[400px] z-50 flex flex-col bg-[var(--glass-overlay)] backdrop-blur-2xl border-l border-[var(--ghost-border-color)] ${className}`}
      role="complementary"
      aria-label="Chat panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--color-on-surface)]">
          AI Coach
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="p-1 rounded-lg text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-2 flex flex-col gap-3"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] py-3 px-4 rounded-xl ${
              msg.sender === 'user'
                ? 'self-end bg-[var(--color-primary-container)] text-[var(--color-on-primary)]'
                : 'self-start bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)]'
            }`}
            aria-label={`${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.text}`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className="self-start bg-[var(--color-surface-container-low)] rounded-xl py-3 px-4">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--color-outline)] animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-[var(--color-outline)] animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-[var(--color-outline)] animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your AI coach..."
          aria-label="Chat message input"
          className="flex-1 bg-[var(--color-surface-container-low)] rounded-xl py-3 px-4 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] border border-[var(--ghost-border-color)] outline-none"
        />
        <button
          onClick={handleSend}
          aria-label="Send message"
          className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-primary)] hover:opacity-85 transition-opacity cursor-pointer"
        >
          <MdSend className="text-lg" />
        </button>
      </div>
    </div>
  );
};
