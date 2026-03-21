import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  VMetricCard,
  VCard,
  VButton,
  VInput,
  VRankBadge,
  VChartLine,
  VEmptyState,
  VSkeletonLoader,
} from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';
import { useScoresStore } from '../../src/stores/useScoresStore';
import { useProfileStore } from '../../src/stores/useProfileStore';
import { calculateOML, ACFTEvent, ACFTAssessment } from '../../src/engine/oml';
import acftTables from '../../src/data/acft-tables.json';

export default function FitnessScreen() {
  const profile = useProfileStore((s) => s.profile);
  const { academic, physical, leadership, loaded, addAssessment, deleteAssessment } =
    useScoresStore();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [eventScores, setEventScores] = useState<Record<string, string>>({});

  const omlResult = calculateOML(profile, academic, physical, leadership);

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ padding: spacing.md }}>
          <VSkeletonLoader height={80} />
          <VSkeletonLoader lines={3} style={{ marginTop: spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  const tierLabel = omlResult.physical.tier === 'none' ? 'No Tier' : omlResult.physical.tier;
  const tierMap: Record<string, 'gold' | 'silver' | 'bronze' | 'default'> = {
    gold: 'gold',
    silver: 'silver',
    bronze: 'bronze',
    none: 'default',
  };

  const handleAddAssessment = async () => {
    const events: ACFTEvent[] = acftTables.events.map((evt) => {
      const raw = parseInt(eventScores[evt.id] || '0', 10);
      return {
        id: evt.id,
        name: evt.name,
        score: Math.min(Math.max(raw, 0), 100),
        rawValue: raw,
      };
    });

    const totalScore = events.reduce((sum, e) => sum + e.score, 0);

    if (totalScore === 0) {
      return Alert.alert('Error', 'Please enter at least one event score.');
    }

    const assessment: ACFTAssessment = {
      id: `acft_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      totalScore,
      events,
    };

    await addAssessment(assessment);
    setEventScores({});
    setAddModalVisible(false);
  };

  const handleDeleteAssessment = (id: string, date: string) => {
    Alert.alert('Delete Assessment', `Remove assessment from ${date}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAssessment(id) },
    ]);
  };

  // Chart data — last 6 assessments
  const chartData = physical.assessmentHistory
    .slice(0, 6)
    .reverse()
    .map((a) => a.totalScore);
  const chartLabels = physical.assessmentHistory
    .slice(0, 6)
    .reverse()
    .map((a) => {
      const parts = a.date.split('-');
      return `${parts[1]}/${parts[2]}`;
    });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>ACFT Log</Text>

        {/* Readiness Score */}
        <View style={styles.readinessRow}>
          <VMetricCard
            label="Readiness Score"
            value={physical.totalScore > 0 ? `${physical.totalScore}/600` : '--'}
            subtitle={`${omlResult.physical.weighted}/${omlResult.physical.max} OML pts`}
            style={styles.readinessCard}
            accessibilityLabel={`ACFT readiness score: ${physical.totalScore} out of 600`}
          />
          <VRankBadge
            label={tierLabel.charAt(0).toUpperCase() + tierLabel.slice(1)}
            tier={tierMap[omlResult.physical.tier]}
          />
        </View>

        {physical.totalScore === 0 && physical.assessmentHistory.length === 0 ? (
          <VEmptyState
            icon="fitness-center"
            title="No fitness assessments recorded"
            subtitle="Log your ACFT scores to track your physical readiness and OML impact."
            actionLabel="Log Your First ACFT"
            onAction={() => setAddModalVisible(true)}
          />
        ) : (
          <>
            {/* Event Cards Grid */}
            <Text style={styles.sectionTitle}>Event Scores</Text>
            <View style={styles.eventsGrid}>
              {acftTables.events.map((evt) => {
                const eventData = physical.events.find((e) => e.id === evt.id);
                return (
                  <VCard key={evt.id} variant="outlined" style={styles.eventCard}>
                    <Text style={styles.eventName}>{evt.name}</Text>
                    <Text style={styles.eventScore}>
                      {eventData ? `${eventData.score}` : '--'}
                    </Text>
                    <Text style={styles.eventUnit}>/{acftTables.maxScorePerEvent}</Text>
                  </VCard>
                );
              })}
            </View>

            {/* Performance Trend */}
            {chartData.length >= 2 && (
              <VCard variant="filled" style={styles.chartCard}>
                <VChartLine
                  data={chartData}
                  labels={chartLabels}
                  title="Performance Trend"
                  height={140}
                  color={colors.primary}
                />
              </VCard>
            )}

            {/* Assessment History */}
            {physical.assessmentHistory.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Assessment History</Text>
                {physical.assessmentHistory.map((assessment) => (
                  <VCard key={assessment.id} variant="outlined" style={styles.historyCard}>
                    <View style={styles.historyRow}>
                      <View>
                        <Text style={styles.historyDate}>{assessment.date}</Text>
                        <Text style={styles.historyScore}>
                          {assessment.totalScore}/600
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteAssessment(assessment.id, assessment.date)}
                        accessibilityLabel={`Delete assessment from ${assessment.date}`}
                        accessibilityRole="button"
                        style={styles.deleteButton}
                      >
                        <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                      </Pressable>
                    </View>
                  </VCard>
                ))}
              </>
            )}
          </>
        )}

        {/* Log Button */}
        <VButton
          title="Log New Assessment"
          onPress={() => setAddModalVisible(true)}
          variant="filled"
          style={styles.logButton}
          icon={<MaterialIcons name="add" size={18} color={colors.onPrimary} />}
          accessibilityLabel="Log a new ACFT assessment"
        />
      </ScrollView>

      {/* Add Assessment Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log ACFT</Text>
            <Pressable
              onPress={() => setAddModalVisible(false)}
              accessibilityLabel="Close"
              accessibilityRole="button"
              style={styles.modalClose}
            >
              <MaterialIcons name="close" size={24} color={colors.onSurface} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Enter your score (0-100) for each event
            </Text>
            {acftTables.events.map((evt) => (
              <VInput
                key={evt.id}
                label={evt.name}
                value={eventScores[evt.id] || ''}
                onChangeText={(text) =>
                  setEventScores((prev) => ({ ...prev, [evt.id]: text }))
                }
                placeholder="0-100"
                keyboardType="number-pad"
                accessibilityLabel={`${evt.name} score`}
              />
            ))}

            <VButton
              title="Save Assessment"
              onPress={handleAddAssessment}
              variant="filled"
              style={{ marginTop: spacing.md, marginBottom: spacing.xxl }}
              accessibilityLabel="Save ACFT assessment"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  title: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  readinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  readinessCard: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  eventCard: {
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  eventName: {
    ...typography.labelSmall,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  eventScore: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    fontWeight: '600',
  },
  eventUnit: {
    ...typography.bodySmall,
    color: colors.outline,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  historyCard: {
    marginBottom: spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    ...typography.titleSmall,
    color: colors.onSurface,
  },
  historyScore: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  deleteButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButton: {
    marginTop: spacing.lg,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  modalTitle: {
    ...typography.titleLarge,
    color: colors.onSurface,
  },
  modalClose: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: spacing.md,
  },
  modalSubtitle: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
});
