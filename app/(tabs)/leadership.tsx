import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  VCard,
  VButton,
  VInput,
  VMetricCard,
  VRankBadge,
  VEmptyState,
  VSkeletonLoader,
} from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';
import {
  getLeadershipEntries,
  insertLeadershipEntry,
  deleteLeadershipEntry,
  type LeadershipEntryRow,
} from '../../src/services/storage';
import { generateMicroInsight } from '../../src/services/ai';

const ENTRY_TYPES = ['Command Role', 'Staff Position', 'Extracurricular', 'Achievement'];

export default function LeadershipScreen() {
  const [entries, setEntries] = useState<LeadershipEntryRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [entryType, setEntryType] = useState(ENTRY_TYPES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const rows = await getLeadershipEntries();
      setEntries(rows);
    } catch (error) {
      console.error('Failed to load leadership entries:', error);
    }
    setIsLoaded(true);
  }

  async function handleAddEntry() {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for this entry.');
      return;
    }

    try {
      const entryTitle = title.trim();
      const entryPoints = points ? parseFloat(points) : 0;

      await insertLeadershipEntry({
        type: entryType,
        title: entryTitle,
        description: description.trim() || null,
        points: points ? parseFloat(points) : null,
        start_date: null,
        end_date: null,
      });
      setTitle('');
      setDescription('');
      setPoints('');
      setShowForm(false);
      await loadEntries();

      // Show post-entry micro-insight
      const pointsText = entryPoints > 0 ? ` (+${entryPoints} leadership points)` : '';
      Alert.alert(
        'Entry Saved',
        `${entryType}: ${entryTitle}${pointsText}`
      );

      // Fire-and-forget AI enhancement
      generateMicroInsight(
        '{}',
        `logged ${entryType} "${entryTitle}"`,
        entryPoints
      )
        .then((insight) => {
          if (insight) {
            Alert.alert('Vanguard AI', insight);
          }
        })
        .catch(() => {});
    } catch (error) {
      console.error('Failed to add leadership entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    }
  }

  async function handleDeleteEntry(id: number) {
    Alert.alert('Delete Entry', 'Are you sure you want to remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLeadershipEntry(id);
            await loadEntries();
          } catch (error) {
            console.error('Failed to delete entry:', error);
          }
        },
      },
    ]);
  }

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContent}>
          <VSkeletonLoader width="100%" height={60} />
          <VSkeletonLoader width="100%" height={48} style={{ marginTop: spacing[3] }} />
          <VSkeletonLoader width="100%" height={48} style={{ marginTop: spacing[3] }} />
        </View>
      </SafeAreaView>
    );
  }

  if (entries.length === 0 && !showForm) {
    return (
      <SafeAreaView style={styles.container}>
        <VEmptyState
          icon={'\u{1F396}'}
          headline="Your Leadership Journey Starts Here"
          body="Log command roles, staff positions, and extracurriculars to build your leadership pillar."
          ctaLabel="Log Your First Role"
          onCtaPress={() => setShowForm(true)}
        />
      </SafeAreaView>
    );
  }

  const commandRoles = entries.filter((e) => e.type === 'Command Role');
  const staffPositions = entries.filter((e) => e.type === 'Staff Position');
  const extracurriculars = entries.filter((e) => e.type === 'Extracurricular');
  const achievements = entries.filter((e) => e.type === 'Achievement');

  const totalPoints = entries.reduce((sum, e) => sum + (e.points ?? 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header} accessibilityRole="header">
          Leadership Log
        </Text>

        {/* Summary */}
        <View style={styles.metricsRow}>
          <VMetricCard
            value={String(entries.length)}
            label="Total Entries"
            style={styles.metricCard}
            accessibilityLabel={`${entries.length} leadership entries`}
          />
          <VMetricCard
            value={String(commandRoles.length)}
            label="Command Roles"
            style={styles.metricCard}
            accessibilityLabel={`${commandRoles.length} command roles`}
          />
        </View>

        {/* Add Entry */}
        {!showForm ? (
          <VButton
            label="Add Entry"
            onPress={() => setShowForm(true)}
            variant="secondary"
            style={styles.addButton}
            accessibilityLabel="Add a new leadership entry"
          />
        ) : (
          <VCard tier="low" style={styles.formCard}>
            <Text style={styles.formTitle}>New Leadership Entry</Text>

            {/* Type Selector */}
            <Text style={styles.typeLabel}>Type</Text>
            <View style={styles.typeRow}>
              {ENTRY_TYPES.map((type) => (
                <VButton
                  key={type}
                  label={type}
                  onPress={() => setEntryType(type)}
                  variant={entryType === type ? 'primary' : 'secondary'}
                  style={styles.typeButton}
                  accessibilityLabel={`Select ${type} type${entryType === type ? ', currently selected' : ''}`}
                />
              ))}
            </View>

            <VInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="Battalion Commander"
              accessibilityLabel="Entry title input"
            />
            <VInput
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Led 200+ cadets in field training exercises"
              multiline
              accessibilityLabel="Entry description input"
            />
            <VInput
              label="Points (optional)"
              value={points}
              onChangeText={setPoints}
              placeholder="20"
              keyboardType="numeric"
              accessibilityLabel="Points value input"
            />

            <View style={styles.formActions}>
              <VButton
                label="Cancel"
                onPress={() => setShowForm(false)}
                variant="tertiary"
              />
              <VButton label="Save Entry" onPress={handleAddEntry} />
            </View>
          </VCard>
        )}

        {/* Command Roles */}
        {commandRoles.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Command Roles</Text>
            {commandRoles.map((entry) => (
              <VCard key={entry.id} tier="low" style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryInfo}>
                    <VRankBadge rank={entry.type} />
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                  </View>
                  {entry.points != null && (
                    <Text style={styles.entryPoints}>+{entry.points}</Text>
                  )}
                </View>
                {entry.description && (
                  <Text style={styles.entryDesc}>{entry.description}</Text>
                )}
                <VButton
                  label="Remove"
                  onPress={() => entry.id != null && handleDeleteEntry(entry.id)}
                  variant="tertiary"
                  accessibilityLabel={`Remove ${entry.title}`}
                />
              </VCard>
            ))}
          </>
        )}

        {/* Staff Positions */}
        {staffPositions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Staff Positions</Text>
            {staffPositions.map((entry) => (
              <VCard key={entry.id} tier="low" style={styles.entryCard}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                {entry.description && (
                  <Text style={styles.entryDesc}>{entry.description}</Text>
                )}
                <VButton
                  label="Remove"
                  onPress={() => entry.id != null && handleDeleteEntry(entry.id)}
                  variant="tertiary"
                />
              </VCard>
            ))}
          </>
        )}

        {/* Extracurriculars */}
        {extracurriculars.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Extracurriculars</Text>
            {extracurriculars.map((entry) => (
              <VCard key={entry.id} tier="low" style={styles.entryCard}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                {entry.description && (
                  <Text style={styles.entryDesc}>{entry.description}</Text>
                )}
                <VButton
                  label="Remove"
                  onPress={() => entry.id != null && handleDeleteEntry(entry.id)}
                  variant="tertiary"
                />
              </VCard>
            ))}
          </>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {achievements.map((entry) => (
              <VCard key={entry.id} tier="low" style={styles.entryCard}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                {entry.description && (
                  <Text style={styles.entryDesc}>{entry.description}</Text>
                )}
                <VButton
                  label="Remove"
                  onPress={() => entry.id != null && handleDeleteEntry(entry.id)}
                  variant="tertiary"
                />
              </VCard>
            ))}
          </>
        )}
      </ScrollView>
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
    paddingBottom: spacing[12],
  },
  loadingContent: {
    padding: spacing[4],
    paddingTop: spacing[8],
  },
  header: {
    ...typography.headline_lg,
    color: colors.on_surface,
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  metricCard: {
    flex: 1,
  },
  addButton: {
    marginBottom: spacing[4],
  },
  formCard: {
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  formTitle: {
    ...typography.title_md,
    color: colors.on_surface,
  },
  typeLabel: {
    ...typography.label_md,
    color: colors.on_surface,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  typeButton: {
    paddingHorizontal: spacing[3],
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  sectionTitle: {
    ...typography.title_md,
    color: colors.on_surface,
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  entryCard: {
    marginBottom: spacing[3],
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  entryInfo: {
    flex: 1,
    gap: spacing[2],
  },
  entryTitle: {
    ...typography.title_sm,
    color: colors.on_surface,
  },
  entryPoints: {
    ...typography.title_md,
    color: colors.tertiary,
  },
  entryDesc: {
    ...typography.body_sm,
    color: colors.outline,
    marginBottom: spacing[2],
  },
});
