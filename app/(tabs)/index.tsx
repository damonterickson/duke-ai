import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  VGlassPanel,
  VMetricCard,
  VFAB,
  VChatSheet,
  VSkeletonLoader,
  VCard,
} from '../../src/components';
import type { ChatMessage } from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';
import { useProfileStore } from '../../src/stores/profile';
import { useScoresStore } from '../../src/stores/scores';
import { useConversationsStore } from '../../src/stores/conversations';
import { generateBriefing, streamChat } from '../../src/services/ai';
import type { AIMessage } from '../../src/services/ai';
import { getCachedBriefing } from '../../src/services/storage';
import { buildContext } from '../../src/engine/context';
import type { CadetProfile, OMLResult } from '../../src/engine/oml';
import type { ConversationTurn } from '../../src/engine/context';

export default function AdvisorScreen() {
  const router = useRouter();
  const profile = useProfileStore();
  const scores = useScoresStore();
  const conversations = useConversationsStore();

  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Build a CadetProfile from store state for context engine
  const buildCadetProfile = useCallback((): CadetProfile | null => {
    if (!profile.yearGroup || !profile.gender || !profile.ageBracket) return null;
    const latestScore = scores.scoreHistory[0];
    return {
      gpa: latestScore?.gpa ?? 0,
      mslGpa: latestScore?.msl_gpa ?? 0,
      acftScores: {},
      leadershipEval: latestScore?.leadership_eval ?? 0,
      cstScore: latestScore?.cst_score ?? undefined,
      clcScore: latestScore?.clc_score ?? undefined,
      commandRoles: [],
      extracurricularHours: 0,
      yearGroup: profile.yearGroup,
      gender: profile.gender,
      ageBracket: profile.ageBracket,
    };
  }, [profile, scores.scoreHistory]);

  // Build minimal OML result for context
  const buildOmlResult = useCallback((): OMLResult => {
    const latestScore = scores.scoreHistory[0];
    return {
      totalScore: latestScore?.total_oml ?? 0,
      pillarScores: {
        academic: 0,
        leadership: 0,
        physical: 0,
      },
      marginalGains: {},
    };
  }, [scores.scoreHistory]);

  // Generate briefing on mount
  useEffect(() => {
    async function loadBriefing() {
      setBriefingLoading(true);
      const cached = getCachedBriefing();
      if (cached) {
        setBriefing(cached);
        setBriefingLoading(false);
      }

      const cadetProfile = buildCadetProfile();
      if (!cadetProfile) {
        setBriefingLoading(false);
        return;
      }

      const omlResult = buildOmlResult();
      const contextJson = buildContext(cadetProfile, omlResult, []);
      const newBriefing = await generateBriefing(contextJson);
      setBriefing(newBriefing);
      setBriefingLoading(false);
    }
    loadBriefing();
  }, [buildCadetProfile, buildOmlResult]);

  // Load existing chat messages from store
  useEffect(() => {
    const msgs: ChatMessage[] = conversations.messages.map((m, i) => ({
      id: String(m.id ?? i),
      text: m.content,
      sender: m.role === 'user' ? 'user' as const : 'ai' as const,
    }));
    setChatMessages(msgs);
  }, [conversations.messages]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      console.log('[CHAT] handleSendMessage called with:', text);
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        text,
        sender: 'user',
      };
      setChatMessages((prev) => [...prev, userMsg]);
      try {
        await conversations.addMessage('user', text);
      } catch (err) {
        console.warn('[CHAT] Failed to persist user message:', err);
      }

      // Create AI placeholder
      const aiMsgId = `ai_${Date.now()}`;
      const aiMsg: ChatMessage = { id: aiMsgId, text: '', sender: 'ai' };
      setChatMessages((prev) => [...prev, aiMsg]);
      setIsStreaming(true);

      let contextJson = '{}';
      try {
        const cadetProfile = buildCadetProfile();
        const omlResult = buildOmlResult();
        const history: ConversationTurn[] = conversations.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: Date.now(),
        }));
        contextJson = cadetProfile
          ? buildContext(cadetProfile, omlResult, history)
          : '{}';
      } catch (err) {
        console.warn('[CHAT] Failed to build context:', err);
      }

      const aiMessages: AIMessage[] = [
        { role: 'user' as const, content: text },
      ];

      console.log('[CHAT] Calling streamChat...');
      let fullText = '';
      await streamChat(aiMessages, contextJson, {
        onToken: (token) => {
          fullText += token;
          const currentText = fullText;
          setChatMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, text: currentText } : m)),
          );
        },
        onComplete: async (complete) => {
          setChatMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, text: complete } : m)),
          );
          await conversations.addMessage('assistant', complete);
          setIsStreaming(false);
        },
        onError: (error) => {
          const errorText =
            error.message === 'OFFLINE'
              ? "I've saved your question. I'll respond when you're back online."
              : 'Vanguard AI is temporarily unavailable. Please try again.';
          setChatMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, text: errorText } : m)),
          );
          setIsStreaming(false);
        },
      });
    },
    [conversations, buildCadetProfile, buildOmlResult],
  );

  const latestScore = scores.scoreHistory[0];
  const totalOml = latestScore?.total_oml ?? null;
  const gpa = latestScore?.gpa ?? null;
  const acftTotal = latestScore?.acft_total ?? null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.header} accessibilityRole="header">
          Vanguard AI
        </Text>
        <Text style={styles.subtitle}>Your OML Mentor</Text>

        {/* Briefing Card */}
        <VGlassPanel
          style={styles.briefingPanel}
          accessibilityLabel="Daily briefing from Vanguard AI"
        >
          {briefingLoading ? (
            <View style={styles.briefingLoading}>
              <VSkeletonLoader width="100%" height={16} />
              <VSkeletonLoader width="80%" height={16} style={{ marginTop: spacing[2] }} />
              <VSkeletonLoader width="60%" height={16} style={{ marginTop: spacing[2] }} />
            </View>
          ) : (
            <>
              <Text style={styles.briefingTitle}>Daily Briefing</Text>
              <Text style={styles.briefingText}>
                {briefing ?? 'Enter your scores to get a personalized briefing.'}
              </Text>
            </>
          )}
        </VGlassPanel>

        {/* Key Metrics */}
        <View style={styles.metricsRow}>
          <VMetricCard
            value={totalOml != null ? String(Math.round(totalOml)) : '--'}
            label="OML Score"
            style={styles.metricCard}
            accessibilityLabel={
              totalOml != null
                ? `OML Score: ${Math.round(totalOml)} out of 1000`
                : 'OML Score: not yet calculated'
            }
          />
          <VMetricCard
            value={gpa != null ? gpa.toFixed(2) : '--'}
            label="GPA"
            style={styles.metricCard}
            accessibilityLabel={
              gpa != null ? `GPA: ${gpa.toFixed(2)}` : 'GPA: not yet entered'
            }
          />
          <VMetricCard
            value={acftTotal != null ? String(Math.round(acftTotal)) : '--'}
            label="ACFT"
            style={styles.metricCard}
            accessibilityLabel={
              acftTotal != null
                ? `ACFT Score: ${Math.round(acftTotal)} out of 600`
                : 'ACFT Score: not yet entered'
            }
          />
        </View>

        {/* Optimization Paths */}
        <Text style={styles.sectionTitle}>Optimization Paths</Text>
        <VCard tier="low" style={styles.pathCard}>
          <Text style={styles.pathTitle}>Academic</Text>
          <Text style={styles.pathDesc}>
            {gpa != null
              ? `Current GPA: ${gpa.toFixed(2)}. Raise it to unlock more OML points.`
              : 'Add your GPA to see academic optimization opportunities.'}
          </Text>
        </VCard>
        <VCard tier="low" style={styles.pathCard}>
          <Text style={styles.pathTitle}>Physical</Text>
          <Text style={styles.pathDesc}>
            {acftTotal != null
              ? `Current ACFT: ${Math.round(acftTotal)}. Every 10 points adds to your OML.`
              : 'Log your ACFT scores to see fitness optimization opportunities.'}
          </Text>
        </VCard>
        <VCard tier="low" style={styles.pathCard}>
          <Text style={styles.pathTitle}>Leadership</Text>
          <Text style={styles.pathDesc}>
            Log command roles and extracurriculars to maximize your leadership pillar.
          </Text>
        </VCard>
      </ScrollView>

      {/* FAB for chat */}
      <VFAB
        icon={'\u2728'}
        onPress={() => setChatVisible(true)}
        accessibilityLabel="Open AI chat"
      />

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
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[16],
  },
  header: {
    ...typography.headline_lg,
    color: colors.on_surface,
    marginTop: spacing[2],
  },
  subtitle: {
    ...typography.body_md,
    color: colors.outline,
    marginBottom: spacing[4],
  },
  briefingPanel: {
    marginBottom: spacing[4],
  },
  briefingLoading: {
    gap: spacing[2],
  },
  briefingTitle: {
    ...typography.title_sm,
    color: colors.primary,
    marginBottom: spacing[2],
  },
  briefingText: {
    ...typography.body_md,
    color: colors.on_surface,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  metricCard: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.title_md,
    color: colors.on_surface,
    marginBottom: spacing[3],
  },
  pathCard: {
    marginBottom: spacing[3],
  },
  pathTitle: {
    ...typography.title_sm,
    color: colors.on_surface,
    marginBottom: spacing[1],
  },
  pathDesc: {
    ...typography.body_sm,
    color: colors.outline,
  },
});
