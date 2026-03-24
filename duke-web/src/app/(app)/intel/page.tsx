'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MdAnalytics, MdMenuBook, MdDirectionsRun, MdBalance, MdAutoAwesome } from 'react-icons/md';
import { VGlassPanel, VSkeletonLoader, VFAB, VChatSheet } from '@/components';
import type { ChatMessage } from '@/components';
import { useProfileStore } from '@/stores/profile';
import { useScoresStore } from '@/stores/scores';
import { useConversationsStore } from '@/stores/conversations';
import { useGoalsStore } from '@/stores/goals';

export default function IntelPage() {
  const router = useRouter();
  const profile = useProfileStore();
  const scores = useScoresStore();
  const conversations = useConversationsStore();
  const goalsStore = useGoalsStore();

  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Simulate briefing load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (profile.yearGroup) {
        setBriefing(
          'Based on your current scores and profile, here are your optimization opportunities. Focus on maximizing your strongest pillar while maintaining steady improvement across all areas.',
        );
      }
      setBriefingLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [profile.yearGroup]);

  // Chat messages from store
  useEffect(() => {
    setChatMessages(
      conversations.messages.map((m: any, i: number) => ({
        id: String(m.id ?? i),
        text: m.content,
        sender: m.role === 'user' ? ('user' as const) : ('ai' as const),
      })),
    );
  }, [conversations.messages]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = { id: `user_${Date.now()}`, text, sender: 'user' };
      setChatMessages((prev) => [...prev, userMsg]);

      const aiMsgId = `ai_${Date.now()}`;
      setChatMessages((prev) => [...prev, { id: aiMsgId, text: '', sender: 'ai' }]);
      setIsStreaming(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: text }] }),
        });

        if (!res.ok) throw new Error('Chat API error');

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            const cur = fullText;
            setChatMessages((prev) =>
              prev.map((m) => (m.id === aiMsgId ? { ...m, text: cur } : m)),
            );
          }
        }

        setChatMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, text: fullText || 'Vanguard AI is temporarily unavailable.' } : m)),
        );
      } catch {
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, text: 'Vanguard AI is temporarily unavailable.' } : m,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [],
  );

  const pathCards = [
    {
      icon: MdMenuBook,
      title: 'Academic Optimization',
      desc: 'Maximize GPA impact on your OML',
      highlighted: false,
    },
    {
      icon: MdDirectionsRun,
      title: 'Physical Optimization',
      desc: 'Push your ACFT score higher',
      highlighted: false,
    },
    {
      icon: MdBalance,
      title: 'Balanced Approach',
      desc: 'Optimize all pillars equally',
      highlighted: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-primary)]">
        <h1 className="text-base font-bold tracking-[2px] text-white">DUKE VANGUARD</h1>
        <MdAnalytics size={24} className="text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[var(--color-surface)] p-4 pb-16">
        {/* AI Briefing Hero */}
        <VGlassPanel className="mb-4">
          <span className="text-sm font-semibold uppercase tracking-[1px] text-[var(--color-primary)] mb-2 block">
            Vanguard Intelligence Brief
          </span>
          {briefingLoading ? (
            <div className="flex flex-col gap-2">
              <VSkeletonLoader width="100%" height={16} />
              <VSkeletonLoader width="80%" height={16} />
              <VSkeletonLoader width="60%" height={16} />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-[var(--color-on-surface)]">
              {briefing ?? 'Enter your scores to receive an intelligence brief.'}
            </p>
          )}
          <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold cursor-pointer hover:opacity-85"
              onClick={() => router.push('/intelligence-brief')}
              aria-label="View full intelligence brief"
            >
              Full Analysis
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer hover:opacity-85"
              onClick={() => {
                setBriefing(null);
                window.alert('Archived. Briefing has been archived. A new one will be generated on your next visit.');
              }}
              aria-label="Archive current briefing"
            >
              Archive
            </button>
          </div>
        </VGlassPanel>

        {/* Optimization Paths */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-2">
          Optimization Paths
        </h2>
        {pathCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <button
              key={i}
              className={`w-full flex items-center gap-3 p-4 rounded-xl mb-3 text-left cursor-pointer hover:opacity-90 transition-opacity ${
                card.highlighted
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-[var(--color-surface-container)]'
              }`}
              aria-label={card.title}
              onClick={() => router.push('/profile')}
            >
              <Icon
                size={28}
                className={card.highlighted ? 'text-[var(--color-on-primary)]' : 'text-[var(--color-primary)]'}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-base font-semibold ${
                      card.highlighted ? 'text-[var(--color-on-primary)]' : 'text-[var(--color-on-surface)]'
                    }`}
                  >
                    {card.title}
                  </span>
                  {card.highlighted && (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[var(--color-on-primary)] text-[var(--color-primary)]">
                      Recommended
                    </span>
                  )}
                </div>
                <span
                  className={`text-sm mt-1 block ${
                    card.highlighted ? 'text-[var(--color-on-primary)]' : 'text-[var(--color-outline)]'
                  }`}
                >
                  {card.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chat FAB */}
      <VFAB
        onPress={() => setChatVisible(!chatVisible)}
        icon={MdAutoAwesome}
        label="Open AI chat"
      />

      {/* Chat Sheet */}
      <VChatSheet
        messages={chatMessages}
        onSend={handleSendMessage}
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        loading={isStreaming}
      />
    </div>
  );
}
