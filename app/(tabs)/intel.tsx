import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { VGlassPanel, VSkeletonLoader, VFAB, VChatSheet } from '../../src/components';
import type { ChatMessage } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../../src/theme/tokens';
import { useProfileStore } from '../../src/stores/profile';
import { useScoresStore } from '../../src/stores/scores';
import { useConversationsStore } from '../../src/stores/conversations';
import { useGoalsStore } from '../../src/stores/goals';
import { generateBriefing, streamChat, setLocalFallbackData } from '../../src/services/ai';
import type { AIMessage } from '../../src/services/ai';
import type { GoalAction } from '../../src/services/goalEngine';
import { getCachedBriefing } from '../../src/services/storage';
import { buildContext } from '../../src/engine/context';
import type { CadetProfile, OMLResult } from '../../src/engine/oml';
import type { ConversationTurn } from '../../src/engine/context';

export default function IntelScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const profile = useProfileStore();
  const scores = useScoresStore();
  const conversations = useConversationsStore();
  const goalsStore = useGoalsStore();

  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const headerBg = isDark ? colors.surface_container_high : '#343c0a';

  const buildCadetProfile = useCallback((): CadetProfile | null => {
    if (!profile.yearGroup || !profile.gender || !profile.ageBracket) return null;
    const s = scores.scoreHistory[0];
    return {
      gpa: s?.gpa ?? 0, mslGpa: s?.msl_gpa ?? 0, acftScores: {},
      leadershipEval: s?.leadership_eval ?? 0,
      cstScore: s?.cst_score ?? undefined, clcScore: s?.clc_score ?? undefined,
      commandRoles: [], extracurricularHours: 0,
      yearGroup: profile.yearGroup, gender: profile.gender, ageBracket: profile.ageBracket,
    };
  }, [profile, scores.scoreHistory]);

  const buildOmlResult = useCallback((): OMLResult => {
    const s = scores.scoreHistory[0];
    return { totalScore: s?.total_oml ?? 0, pillarScores: { academic: 0, leadership: 0, physical: 0 }, marginalGains: {} };
  }, [scores.scoreHistory]);

  // Load briefing
  useEffect(() => {
    async function load() {
      setBriefingLoading(true);
      const cached = getCachedBriefing();
      if (cached) { setBriefing(cached); setBriefingLoading(false); }

      const cadetProfile = buildCadetProfile();
      const omlResult = buildOmlResult();
      setLocalFallbackData(cadetProfile, omlResult, goalsStore.getActiveGoals(), scores.scoreHistory);

      if (!cadetProfile) { setBriefingLoading(false); return; }
      const ctx = buildContext(cadetProfile, omlResult, [], undefined, goalsStore.getActiveGoals(), scores.scoreHistory);
      try {
        const text = await generateBriefing(ctx);
        setBriefing(text);
      } catch (err) { console.error('Briefing error:', err); }
      finally { setBriefingLoading(false); }
    }
    load();
  }, [buildCadetProfile, buildOmlResult, goalsStore, scores.scoreHistory]);

  // Chat messages from store
  useEffect(() => {
    setChatMessages(conversations.messages.map((m, i) => ({
      id: String(m.id ?? i), text: m.content,
      sender: m.role === 'user' ? 'user' as const : 'ai' as const,
    })));
  }, [conversations.messages]);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { id: `user_${Date.now()}`, text, sender: 'user' };
    setChatMessages(prev => [...prev, userMsg]);
    await conversations.addMessage('user', text).catch(() => {});

    const aiMsgId = `ai_${Date.now()}`;
    setChatMessages(prev => [...prev, { id: aiMsgId, text: '', sender: 'ai' }]);
    setIsStreaming(true);

    let contextJson = '{}';
    try {
      const cp = buildCadetProfile();
      const oml = buildOmlResult();
      const history: ConversationTurn[] = conversations.messages.map(m => ({
        role: m.role as 'user' | 'assistant', content: m.content, timestamp: Date.now(),
      }));
      contextJson = cp ? buildContext(cp, oml, history) : '{}';
    } catch {}

    const aiMessages: AIMessage[] = [{ role: 'user', content: text }];
    let fullText = '';
    await streamChat(aiMessages, contextJson, {
      onToken: (token) => {
        fullText += token;
        const cur = fullText;
        setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: cur } : m));
      },
      onComplete: async (complete: string, goalActions?: GoalAction[]) => {
        setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: complete } : m));
        await conversations.addMessage('assistant', complete);
        setIsStreaming(false);
      },
      onError: (error) => {
        const msg = error.message === 'OFFLINE'
          ? "Saved your question. I'll respond when you're back online."
          : 'Vanguard AI is temporarily unavailable.';
        setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: msg } : m));
        setIsStreaming(false);
      },
    });
  }, [conversations, buildCadetProfile, buildOmlResult]);

  const pathCards: Array<{ icon: keyof typeof MaterialIcons.glyphMap; title: string; desc: string; highlighted?: boolean }> = [
    { icon: 'menu-book', title: 'Academic Optimization', desc: 'Maximize GPA impact on your OML' },
    { icon: 'directions-run', title: 'Physical Optimization', desc: 'Push your ACFT score higher' },
    { icon: 'balance', title: 'Balanced Approach', desc: 'Optimize all pillars equally', highlighted: true },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: headerBg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Text style={styles.headerText}>DUKE VANGUARD</Text>
        <MaterialIcons name="analytics" size={24} color="#ffffff" />
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.surface }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Briefing Hero */}
        <VGlassPanel style={styles.briefingPanel}>
          <Text style={[styles.briefingLabel, { color: colors.primary }]}>Vanguard Intelligence Brief</Text>
          {briefingLoading ? (
            <View style={styles.loaderWrap}>
              <VSkeletonLoader width="100%" height={16} />
              <VSkeletonLoader width="80%" height={16} style={{ marginTop: spacing[2] }} />
              <VSkeletonLoader width="60%" height={16} style={{ marginTop: spacing[2] }} />
            </View>
          ) : (
            <Text style={[styles.briefingText, { color: colors.on_surface }]}>
              {briefing ?? 'Enter your scores to receive an intelligence brief.'}
            </Text>
          )}
          <View style={styles.briefingActions}>
            <TouchableOpacity
              style={[styles.briefBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/intelligence-brief' as any)}
              accessibilityLabel="View full intelligence brief"
            >
              <Text style={[styles.briefBtnText, { color: colors.on_primary }]}>Full Analysis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.briefBtn, { backgroundColor: colors.surface_container }]}>
              <Text style={[styles.briefBtnText, { color: colors.on_surface }]}>Archive</Text>
            </TouchableOpacity>
          </View>
        </VGlassPanel>

        {/* Optimization Paths */}
        <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>Optimization Paths</Text>
        {pathCards.map((card, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.pathCard,
              { backgroundColor: card.highlighted ? colors.primary : colors.surface_container },
            ]}
            accessibilityLabel={card.title}
          >
            <MaterialIcons
              name={card.icon as any}
              size={28}
              color={card.highlighted ? colors.on_primary : colors.primary}
            />
            <View style={styles.pathContent}>
              <View style={styles.pathTitleRow}>
                <Text style={[styles.pathTitle, { color: card.highlighted ? colors.on_primary : colors.on_surface }]}>
                  {card.title}
                </Text>
                {card.highlighted && (
                  <View style={[styles.badge, { backgroundColor: colors.on_primary }]}>
                    <Text style={[styles.badgeText, { color: colors.primary }]}>Recommended</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.pathDesc, { color: card.highlighted ? colors.on_primary : colors.outline }]}>
                {card.desc}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chat FAB */}
      <VFAB icon={'\u2728'} onPress={() => setChatVisible(!chatVisible)} accessibilityLabel="Open AI chat" />

      {/* Chat Sheet */}
      <VChatSheet
        messages={chatMessages}
        onSend={handleSendMessage}
        visible={chatVisible}
        accessibilityLabel="Chat with Vanguard AI"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
  },
  headerText: { ...typography.title_md, color: '#ffffff', letterSpacing: 2, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: spacing[4], paddingBottom: spacing[16] },
  briefingPanel: { marginBottom: spacing[4] },
  briefingLabel: { ...typography.label_lg, marginBottom: spacing[2], textTransform: 'uppercase', letterSpacing: 1 },
  loaderWrap: { gap: spacing[2] },
  briefingText: { ...typography.body_md, lineHeight: 22 },
  briefingActions: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[4] },
  briefBtn: { paddingVertical: spacing[2], paddingHorizontal: spacing[4], borderRadius: roundness.md },
  briefBtnText: { ...typography.label_lg },
  sectionTitle: { ...typography.title_md, marginBottom: spacing[3], marginTop: spacing[2] },
  pathCard: {
    flexDirection: 'row', alignItems: 'center', padding: spacing[4],
    borderRadius: roundness.lg, marginBottom: spacing[3], gap: spacing[3],
  },
  pathContent: { flex: 1 },
  pathTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' },
  pathTitle: { ...typography.title_sm },
  pathDesc: { ...typography.body_sm, marginTop: spacing[1] },
  badge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: roundness.sm },
  badgeText: { ...typography.label_sm },
});
