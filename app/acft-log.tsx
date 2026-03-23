import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../src/theme/tokens';
import { VGlassPanel, VButton, VInput } from '../src/components';
import { useScoresStore } from '../src/stores/scores';

const ACFT_EVENTS = [
  { key: 'mdl', label: 'Max Deadlift (MDL)', unit: 'lbs', max: 340 },
  { key: 'spt', label: 'Standing Power Throw (SPT)', unit: 'm', max: 12.5 },
  { key: 'hrp', label: 'Hand Release Push-Up (HRP)', unit: 'reps', max: 70 },
  { key: 'sdc', label: 'Sprint-Drag-Carry (SDC)', unit: 'mm:ss', max: null },
  { key: 'plk', label: 'Plank (PLK)', unit: 'mm:ss', max: null },
  { key: 'tmr', label: 'Two-Mile Run (2MR)', unit: 'mm:ss', max: null },
] as const;

interface ACFTEntry {
  id: string;
  date: string;
  total: number;
  events: Record<string, string>;
  notes: string;
}

export default function ACFTLogScreen() {
  const router = useRouter();
  const { colors, isDark, glass, ghostBorder } = useTheme();
  const scores = useScoresStore();

  const headerBg = isDark ? colors.surface_container_high : '#343c0a';

  const [showForm, setShowForm] = useState(false);
  const [eventScores, setEventScores] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState<ACFTEntry[]>(() => {
    // Seed from score history if ACFT totals exist
    return scores.scoreHistory
      .filter(s => s.acft_total != null)
      .map((s, i) => ({
        id: `history_${i}`,
        date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        total: Math.round(s.acft_total!),
        events: {},
        notes: '',
      }));
  });

  const handleSave = useCallback(() => {
    // Calculate total from individual event scores (simplified)
    const eventValues = Object.values(eventScores).filter(v => v.trim() !== '');
    if (eventValues.length === 0) {
      Alert.alert('No Scores', 'Enter at least one event score to log an ACFT attempt.');
      return;
    }

    // For numeric events, rough point estimate (simplified scoring)
    let totalEstimate = 0;
    let eventCount = 0;
    ACFT_EVENTS.forEach(event => {
      const val = eventScores[event.key];
      if (val && event.max != null) {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          totalEstimate += Math.min((num / event.max) * 100, 100);
          eventCount++;
        }
      } else if (val) {
        // Time-based events get a default 80 if entered
        totalEstimate += 80;
        eventCount++;
      }
    });
    if (eventCount > 0) {
      totalEstimate = Math.round((totalEstimate / eventCount) * 6); // Scale to ~600 max
    }

    const newEntry: ACFTEntry = {
      id: `acft_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      total: Math.min(totalEstimate, 600),
      events: { ...eventScores },
      notes,
    };

    setEntries(prev => [newEntry, ...prev]);
    setEventScores({});
    setNotes('');
    setShowForm(false);

    Alert.alert('ACFT Logged', `Total estimated score: ${newEntry.total}/600`);
  }, [eventScores, notes]);

  const getScoreColor = (total: number): string => {
    if (total >= 500) return '#4caf50';
    if (total >= 400) return colors.tertiary;
    if (total >= 360) return colors.primary;
    return colors.error;
  };

  const renderEntry = ({ item }: { item: ACFTEntry }) => (
    <View
      style={[
        styles.entryCard,
        {
          backgroundColor: glass.overlayColor,
          borderColor: ghostBorder.color,
          borderWidth: ghostBorder.width,
        },
      ]}
    >
      <View style={styles.entryHeader}>
        <View>
          <Text style={[styles.entryDate, { color: colors.outline }]}>{item.date}</Text>
          {item.notes ? (
            <Text style={[styles.entryNotes, { color: colors.outline }]} numberOfLines={1}>
              {item.notes}
            </Text>
          ) : null}
        </View>
        <View style={styles.entryScoreWrap}>
          <Text style={[styles.entryTotal, { color: getScoreColor(item.total) }]}>
            {item.total}
          </Text>
          <Text style={[styles.entryMax, { color: colors.outline }]}>/600</Text>
        </View>
      </View>
      {Object.keys(item.events).length > 0 && (
        <View style={styles.eventTags}>
          {ACFT_EVENTS.map(event => {
            const val = item.events[event.key];
            if (!val) return null;
            return (
              <View key={event.key} style={[styles.eventTag, { backgroundColor: colors.surface_container }]}>
                <Text style={[styles.eventTagLabel, { color: colors.outline }]}>
                  {event.key.toUpperCase()}
                </Text>
                <Text style={[styles.eventTagValue, { color: colors.on_surface }]}>
                  {val}{event.unit !== 'mm:ss' ? ` ${event.unit}` : ''}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="fitness-center" size={56} color={colors.outline} />
      <Text style={[styles.emptyTitle, { color: colors.on_surface }]}>No ACFT Records</Text>
      <Text style={[styles.emptyDesc, { color: colors.outline }]}>
        Log your ACFT attempts to track physical fitness progress and its impact on your OML score.
      </Text>
      <VButton
        label="Log First ACFT"
        onPress={() => setShowForm(true)}
        style={styles.emptyCta}
        accessibilityLabel="Log your first ACFT attempt"
      />
    </View>
  );

  const renderForm = () => (
    <VGlassPanel style={styles.formCard}>
      <Text style={[styles.formTitle, { color: colors.on_surface }]}>Log ACFT Attempt</Text>
      <Text style={[styles.formSubtitle, { color: colors.outline }]}>
        Enter your raw scores for each event. Leave blank for events not completed.
      </Text>

      {ACFT_EVENTS.map(event => (
        <View key={event.key} style={styles.eventInputRow}>
          <Text style={[styles.eventLabel, { color: colors.on_surface }]}>{event.label}</Text>
          <VInput
            label=""
            value={eventScores[event.key] ?? ''}
            onChangeText={(v) => setEventScores(prev => ({ ...prev, [event.key]: v }))}
            placeholder={event.unit}
            keyboardType={event.max != null ? 'numeric' : 'default'}
            style={styles.eventInput}
            accessibilityLabel={`${event.label} score`}
          />
        </View>
      ))}

      <VInput
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="e.g., Record ACFT, diagnostic, etc."
        style={styles.notesInput}
        accessibilityLabel="ACFT attempt notes"
      />

      <View style={styles.formActions}>
        <Pressable
          onPress={() => { setShowForm(false); setEventScores({}); setNotes(''); }}
          style={[styles.cancelBtn, { borderColor: colors.outline }]}
          accessibilityLabel="Cancel"
        >
          <Text style={[styles.cancelText, { color: colors.on_surface }]}>Cancel</Text>
        </Pressable>
        <VButton
          label="Save ACFT"
          onPress={handleSave}
          style={styles.saveBtn}
          accessibilityLabel="Save ACFT attempt"
        />
      </View>
    </VGlassPanel>
  );

  const renderHeader = () => (
    <View>
      {/* Summary Stats */}
      {entries.length > 0 && !showForm && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface_container }]}>
            <Text style={[styles.summaryLabel, { color: colors.outline }]}>BEST SCORE</Text>
            <Text style={[styles.summaryValue, { color: getScoreColor(Math.max(...entries.map(e => e.total))) }]}>
              {Math.max(...entries.map(e => e.total))}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface_container }]}>
            <Text style={[styles.summaryLabel, { color: colors.outline }]}>LATEST</Text>
            <Text style={[styles.summaryValue, { color: getScoreColor(entries[0]?.total ?? 0) }]}>
              {entries[0]?.total ?? '--'}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface_container }]}>
            <Text style={[styles.summaryLabel, { color: colors.outline }]}>ATTEMPTS</Text>
            <Text style={[styles.summaryValue, { color: colors.on_surface }]}>{entries.length}</Text>
          </View>
        </View>
      )}

      {/* New entry form */}
      {showForm && renderForm()}

      {/* Section title */}
      {entries.length > 0 && !showForm && (
        <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>ACFT History</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: headerBg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerText}>ACFT LOG</Text>
        {!showForm ? (
          <Pressable onPress={() => setShowForm(true)} hitSlop={12} accessibilityLabel="Add ACFT entry">
            <MaterialIcons name="add" size={24} color="#ffffff" />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={showForm ? null : renderEmpty}
        contentContainerStyle={[styles.list, { backgroundColor: colors.surface }]}
        style={{ backgroundColor: colors.surface }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  headerText: {
    ...typography.title_md,
    color: '#ffffff',
    letterSpacing: 2,
    fontWeight: '700',
  },
  list: { padding: spacing[4], paddingBottom: spacing[16], flexGrow: 1 },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderRadius: roundness.lg,
  },
  summaryLabel: {
    ...typography.label_sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[1],
  },
  summaryValue: { ...typography.headline_sm },

  // Section
  sectionTitle: {
    ...typography.label_lg,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing[3],
  },

  // Entry cards
  entryCard: {
    padding: spacing[4],
    borderRadius: roundness.xl,
    marginBottom: spacing[3],
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryDate: { ...typography.label_md },
  entryNotes: { ...typography.body_sm, marginTop: 2, maxWidth: 200 },
  entryScoreWrap: { flexDirection: 'row', alignItems: 'baseline' },
  entryTotal: { ...typography.headline_sm },
  entryMax: { ...typography.body_sm },
  eventTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    marginTop: spacing[3],
  },
  eventTag: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: roundness.sm,
  },
  eventTagLabel: { ...typography.label_sm },
  eventTagValue: { ...typography.body_sm },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingTop: spacing[10],
  },
  emptyTitle: { ...typography.headline_sm, marginTop: spacing[4], marginBottom: spacing[2] },
  emptyDesc: { ...typography.body_md, textAlign: 'center', marginBottom: spacing[4] },
  emptyCta: { minWidth: 200 },

  // Form
  formCard: { marginBottom: spacing[4] },
  formTitle: { ...typography.title_md, marginBottom: spacing[1] },
  formSubtitle: { ...typography.body_sm, marginBottom: spacing[4] },
  eventInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  eventLabel: { ...typography.body_sm, flex: 1, marginRight: spacing[2] },
  eventInput: { width: 120 },
  notesInput: { marginTop: spacing[3] },
  formActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: roundness.md,
    borderWidth: 1,
  },
  cancelText: { ...typography.label_lg },
  saveBtn: { flex: 1 },
});
