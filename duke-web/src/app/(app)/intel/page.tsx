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
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center justify-between shadow-[var(--shadow-md)]">
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">DUKE VANGUARD</h1>
        <MdAnalytics size={24} className="text-white/80" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl w-full space-y-6">
        {/* AI Briefing Hero */}
        <section className="glass-panel rounded-md p-5 shadow-[var(--shadow-sm)]">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-3 block font-[family-name:var(--font-label)]">
            Vanguard Intelligence Brief
          </span>
          {briefingLoading ? (
            <div className="flex flex-col gap-2">
              <VSkeletonLoader width="100%" height={16} />
              <VSkeletonLoader width="80%" height={16} />
              <VSkeletonLoader width="60%" height={16} />
            </div>
          ) : (
            <p className="text-sm md:text-base leading-relaxed text-[var(--color-on-surface)]">
              {briefing ?? 'Enter your scores to receive an intelligence brief.'}
            </p>
          )}
          <div className="flex gap-3 mt-5">
            <button
              className="px-5 py-2.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
              onClick={() => router.push('/intelligence-brief')}
              aria-label="View full intelligence brief"
            >
              Full Analysis
            </button>
            <button
              className="px-5 py-2.5 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors"
              onClick={() => {
                setBriefing(null);
                window.alert('Archived. Briefing has been archived. A new one will be generated on your next visit.');
              }}
              aria-label="Archive current briefing"
            >
              Archive
            </button>
          </div>
        </section>

        {/* Optimization Paths */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">
            Optimization Paths
          </h2>
          <div className="space-y-3">
            {pathCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <button
                  key={i}
                  className={`w-full flex items-center gap-4 p-4 rounded-md text-left cursor-pointer hover:opacity-90 transition-all border ${
                    card.highlighted
                      ? 'gradient-primary border-transparent shadow-glow'
                      : 'bg-[var(--color-surface-container-low)] border-[var(--ghost-border)] shadow-[var(--shadow-sm)]'
                  }`}
                  aria-label={card.title}
                  onClick={() => router.push('/profile')}
                >
                  <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 ${card.highlighted ? 'bg-white/20' : 'bg-[var(--color-primary-container)]'}`}>
                    <Icon
                      size={24}
                      className={card.highlighted ? 'text-white' : 'text-[var(--color-on-primary-container)]'}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-base font-bold ${
                          card.highlighted ? 'text-white' : 'text-[var(--color-on-surface)]'
                        } font-[family-name:var(--font-display)]`}
                      >
                        {card.title}
                      </span>
                      {card.highlighted && (
                        <span className="px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider gradient-gold text-white font-[family-name:var(--font-label)]">
                          Recommended
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-sm mt-1 block ${
                        card.highlighted ? 'text-white/80' : 'text-[var(--color-on-surface-variant)]'
                      }`}
                    >
                      {card.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
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
