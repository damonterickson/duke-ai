import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {
  VGlassPanel,
  VMetricCard,
  VCard,
  VFAB,
  VChatSheet,
  VSkeletonLoader,
  ChatMessage,
} from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';
import { useProfileStore } from '../../src/stores/useProfileStore';
import { useScoresStore } from '../../src/stores/useScoresStore';
import { useConversationsStore } from '../../src/stores/useConversationsStore';
import { calculateOML } from '../../src/engine/oml';
import { buildContext } from '../../src/engine/context';
import {
  sendMessage as aiSendMessage,
  generateBriefing,
  needsBriefingRefresh,
  computeDataHash,
} from '../../src/services/ai';
import { getCachedBriefing, setDataHash } from '../../src/services/storage';

export default function AdvisorScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const { academic, physical, leadership } = useScoresStore();
  const { messages, addMessage, updateLastAssistantMessage, persistConversation } =
    useConversationsStore();

  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [chatVisible, setChatVisible] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  // Calculate OML
  const omlResult = calculateOML(profile, academic, physical, leadership);
  const context = buildContext(profile, omlResult, academic, physical, leadership, []);

  // Load or refresh briefing
  useEffect(() => {
    async function loadBriefing() {
      setBriefingLoading(true);
      try {
        const dataHash = computeDataHash(academic.gpa, physical.totalScore, leadership.totalScore);

        if (needsBriefingRefresh(dataHash)) {
          const text = await generateBriefing(context);
          setBriefing(text);
          setDataHash(dataHash);
        } else {
          const cached = getCachedBriefing();
          setBriefing(cached || 'Welcome to Iron Vanguard. Add your scores to get personalized AI insights.');
        }
      } catch {
        const cached = getCachedBriefing();
        setBriefing(cached || 'Unable to load briefing. Check your connection and API key.');
      } finally {
        setBriefingLoading(false);
      }
    }
    loadBriefing();
  }, [academic.gpa, physical.totalScore, leadership.totalScore]);

  // Handle chat message
  const handleSendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}_u`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };
      addMessage(userMsg);

      // Add placeholder assistant message
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);

      setIsStreaming(true);
      setStreamingText('');

      try {
        const history = messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

        let fullText = '';
        for await (const token of aiSendMessage(text, context, history)) {
          fullText += token;
          setStreamingText(fullText);
        }

        updateLastAssistantMessage(fullText);
        await persistConversation();
      } catch (err) {
        updateLastAssistantMessage("I couldn't process that response. Please try again.");
      } finally {
        setIsStreaming(false);
        setStreamingText('');
      }
    },
    [context, messages, addMessage, updateLastAssistantMessage, persistConversation]
  );

  // ACFT tier for display
  const tierLabel =
    omlResult.physical.tier === 'none' ? '--' : omlResult.physical.tier.toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vanguard AI</Text>
          <MaterialIcons
            name="settings"
            size={24}
            color={colors.onSurfaceVariant}
            onPress={() => router.push('/settings')}
            accessibilityLabel="Settings"
          />
        </View>

        {/* AI Briefing */}
        <VGlassPanel style={styles.briefingPanel}>
          <View style={styles.briefingHeader}>
            <MaterialIcons name="psychology" size={20} color={colors.onPrimaryContainer} />
            <Text style={styles.briefingTitle}>Daily Briefing</Text>
          </View>
          {briefingLoading ? (
            <VSkeletonLoader lines={3} height={14} />
          ) : (
            <Text style={styles.briefingText}>{briefing}</Text>
          )}
        </VGlassPanel>

        {/* Metric Cards Row */}
        <View style={styles.metricsRow}>
          <VMetricCard
            label="ACFT"
            value={physical.totalScore > 0 ? `${physical.totalScore}` : '--'}
            subtitle={tierLabel}
            accessibilityLabel={`ACFT Score: ${physical.totalScore}`}
          />
          <VMetricCard
            label="GPA"
            value={academic.gpa > 0 ? academic.gpa.toFixed(2) : '--'}
            subtitle="/4.00"
            accessibilityLabel={`GPA: ${academic.gpa.toFixed(2)}`}
          />
          <VMetricCard
            label="OML"
            value={omlResult.totalScore > 0 ? `${omlResult.totalScore}` : '--'}
            subtitle={`/${omlResult.maxScore}`}
            accessibilityLabel={`OML Score: ${omlResult.totalScore} out of ${omlResult.maxScore}`}
          />
        </View>

        {/* Optimization Path Cards */}
        <Text style={styles.sectionTitle}>Optimization Paths</Text>

        <VCard
          variant="outlined"
          style={styles.pathCard}
          onPress={() => router.push('/(tabs)/academics')}
          accessibilityLabel="Academic Focus optimization path"
        >
          <View style={styles.pathHeader}>
            <MaterialIcons name="school" size={24} color={colors.primary} />
            <View style={styles.pathContent}>
              <Text style={styles.pathTitle}>Academic Focus</Text>
              <Text style={styles.pathSubtitle}>
                {omlResult.academic.weighted < omlResult.academic.max * 0.9
                  ? `+${(omlResult.academic.max - omlResult.academic.weighted).toFixed(1)} points available`
                  : 'Near optimal'}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
          </View>
        </VCard>

        <VCard
          variant="outlined"
          style={styles.pathCard}
          onPress={() => router.push('/(tabs)/fitness')}
          accessibilityLabel="Physical Focus optimization path"
        >
          <View style={styles.pathHeader}>
            <MaterialIcons name="fitness-center" size={24} color={colors.primary} />
            <View style={styles.pathContent}>
              <Text style={styles.pathTitle}>Physical Focus</Text>
              <Text style={styles.pathSubtitle}>
                {omlResult.physical.weighted < omlResult.physical.max * 0.9
                  ? `+${(omlResult.physical.max - omlResult.physical.weighted).toFixed(1)} points available`
                  : 'Near optimal'}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
          </View>
        </VCard>

        <VCard
          variant="outlined"
          style={styles.pathCard}
          onPress={() => router.push('/what-if')}
          accessibilityLabel="Balanced Strategy optimization path"
        >
          <View style={styles.pathHeader}>
            <MaterialIcons name="balance" size={24} color={colors.primary} />
            <View style={styles.pathContent}>
              <Text style={styles.pathTitle}>Balanced Strategy</Text>
              <Text style={styles.pathSubtitle}>What-if simulator</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
          </View>
        </VCard>
      </ScrollView>

      {/* FAB */}
      <VFAB
        onPress={() => setChatVisible(true)}
        icon="chat"
        accessibilityLabel="Open AI chat"
      />

      {/* Chat Sheet */}
      <VChatSheet
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        messages={messages}
        onSend={handleSendMessage}
        isStreaming={isStreaming}
        streamingText={streamingText}
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
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    fontWeight: '600',
  },
  briefingPanel: {
    marginBottom: spacing.md,
  },
  briefingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  briefingTitle: {
    ...typography.titleSmall,
    color: colors.onPrimaryContainer,
  },
  briefingText: {
    ...typography.bodyMedium,
    color: colors.onPrimaryContainer,
    lineHeight: 22,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  pathCard: {
    marginBottom: spacing.sm,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
  },
  pathContent: {
    flex: 1,
  },
  pathTitle: {
    ...typography.titleSmall,
    color: colors.onSurface,
  },
  pathSubtitle: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
});
