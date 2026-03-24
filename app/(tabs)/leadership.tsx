import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  VCard,
  VButton,
  VInput,
  VMetricCard,
  VRankBadge,
  VEmptyState,
  VSkeletonLoader,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing } from '../../src/theme/tokens';
import {
  getLeadershipEntries,
  insertLeadershipEntry,
  deleteLeadershipEntry,
  updateLatestScoreHistory,
  type LeadershipEntryRow,
} from '../../src/services/storage';
import { generateMicroInsight } from '../../src/services/ai';
import { useScoresStore } from '../../src/stores/scores';

const isWeb = Platform.OS === 'web';
const ASYNC_KEY_SCORES = '@duke_scores';

const ENTRY_TYPES = ['Command Role', 'Staff Position', 'Extracurricular', 'Achievement'];

export default function LeadershipScreen() {
  const { colors, isDark, glass } = useTheme();
  const [entries, setEntries] = useState<LeadershipEntryRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [entryType, setEntryType] = useState(ENTRY_TYPES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');

  // Score input state
  const scores = useScoresStore();
  const latestScore = scores.scoreHistory.length > 0 ? scores.scoreHistory[0] : null;
  const [leadershipEval, setLeadershipEval] = useState('');
  const [cstScore, setCstScore] = useState('');
  const [clcScore, setClcScore] = useState('');
  const [extracurricularHours, setExtracurricularHours] = useState('');
  const [ecHoursLoaded, setEcHoursLoaded] = useState(false);

  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Pre-populate from latest scores
  useEffect(() => {
    if (latestScore) {
      if (latestScore.leadership_eval != null) setLeadershipEval(String(latestScore.leadership_eval));
      if (latestScore.cst_score != null) setCstScore(String(latestScore.cst_score));
      if (latestScore.clc_score != null) setClcScore(String(latestScore.clc_score));
    }
  }, [latestScore?.leadership_eval, latestScore?.cst_score, latestScore?.clc_score]);

  // Load extracurricular hours from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('@duke_extracurricular_hours')
      .then((val) => {
        if (val != null) setExtracurricularHours(val);
        setEcHoursLoaded(true);
      })
      .catch(() => setEcHoursLoaded(true));
  }, []);

  useEffect(() => {
    loadEntries();
    if (!scores.isLoaded) scores.loadFromSQLite();
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

  function validateScore(value: string, label: string): number | null {
    if (!value.trim()) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 100) {
      Alert.alert('Invalid Score', `${label} must be between 0 and 100.`);
      return null;
    }
    return num;
  }

  async function handleSaveLeadershipEval() {
    const val = validateScore(leadershipEval, 'PMS Evaluation Score');
    if (val === null && leadershipEval.trim()) return; // validation failed
    if (val === null) {
      Alert.alert('Missing Score', 'Please enter a PMS Evaluation Score.');
      return;
    }
    try {
      if (isWeb) {
        // Web fallback: update via AsyncStorage through the store
        await scores.addScoreEntry({
          gpa: latestScore?.gpa ?? null,
          msl_gpa: latestScore?.msl_gpa ?? null,
          acft_total: latestScore?.acft_total ?? null,
          leadership_eval: val,
          cst_score: latestScore?.cst_score ?? null,
          clc_score: latestScore?.clc_score ?? null,
          total_oml: latestScore?.total_oml ?? null,
        });
      } else {
        await updateLatestScoreHistory({ leadership_eval: val });
      }
      await scores.loadFromSQLite();
      Alert.alert('Saved', 'PMS Evaluation Score updated.');
    } catch (error) {
      console.error('Failed to save leadership eval:', error);
      Alert.alert('Error', 'Failed to save score. Please try again.');
    }
  }

  async function handleSaveCSTCLC() {
    const cstVal = validateScore(cstScore, 'CST Score');
    const clcVal = validateScore(clcScore, 'CLC Score');
    // At least one must be provided
    if (cstVal === null && clcVal === null) {
      Alert.alert('Missing Scores', 'Please enter at least one score (CST or CLC).');
      return;
    }
    // If a field has text but failed validation, stop
    if (cstScore.trim() && cstVal === null) return;
    if (clcScore.trim() && clcVal === null) return;

    const updates: Record<string, number | null> = {};
    if (cstVal !== null) updates.cst_score = cstVal;
    if (clcVal !== null) updates.clc_score = clcVal;

    try {
      if (isWeb) {
        await scores.addScoreEntry({
          gpa: latestScore?.gpa ?? null,
          msl_gpa: latestScore?.msl_gpa ?? null,
          acft_total: latestScore?.acft_total ?? null,
          leadership_eval: latestScore?.leadership_eval ?? null,
          cst_score: cstVal ?? latestScore?.cst_score ?? null,
          clc_score: clcVal ?? latestScore?.clc_score ?? null,
          total_oml: latestScore?.total_oml ?? null,
        });
      } else {
        await updateLatestScoreHistory(updates);
      }
      await scores.loadFromSQLite();
      Alert.alert('Saved', 'CST / CLC scores updated.');
    } catch (error) {
      console.error('Failed to save CST/CLC scores:', error);
      Alert.alert('Error', 'Failed to save scores. Please try again.');
    }
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

        {/* Commander's Assessment */}
        <VCard tier="low" style={staticStyles.scoreSection}>
          <Text style={styles.scoreSectionTitle}>Commander's Assessment</Text>
          <VInput
            label="PMS Evaluation Score"
            value={leadershipEval}
            onChangeText={setLeadershipEval}
            placeholder="0–100"
            keyboardType="numeric"
            accessibilityLabel="PMS Evaluation Score input"
          />
          <VButton
            label="Save Evaluation"
            onPress={handleSaveLeadershipEval}
            variant="secondary"
            style={staticStyles.scoreSaveButton}
            accessibilityLabel="Save PMS Evaluation Score"
          />
        </VCard>

        {/* CST / CLC Scores */}
        <VCard tier="low" style={staticStyles.scoreSection}>
          <Text style={styles.scoreSectionTitle}>CST / CLC Scores</Text>
          <View style={staticStyles.scoreRow}>
            <View style={staticStyles.scoreInputHalf}>
              <VInput
                label="CST Score"
                value={cstScore}
                onChangeText={setCstScore}
                placeholder="0–100"
                keyboardType="numeric"
                accessibilityLabel="CST Score input"
              />
            </View>
            <View style={staticStyles.scoreInputHalf}>
              <VInput
                label="CLC Score"
                value={clcScore}
                onChangeText={setClcScore}
                placeholder="0–100"
                keyboardType="numeric"
                accessibilityLabel="CLC Score input"
              />
            </View>
          </View>
          <VButton
            label="Save CST / CLC"
            onPress={handleSaveCSTCLC}
            variant="secondary"
            style={staticStyles.scoreSaveButton}
            accessibilityLabel="Save CST and CLC scores"
          />
        </VCard>

        {/* Extracurricular Hours */}
        <VCard tier="low" style={staticStyles.scoreSection}>
          <Text style={styles.scoreSectionTitle}>Extracurricular Hours</Text>
          <VInput
            label="Total Hours"
            value={extracurricularHours}
            onChangeText={setExtracurricularHours}
            placeholder="Enter total hours"
            keyboardType="numeric"
            accessibilityLabel="Extracurricular hours input"
          />
          <VButton
            label="Save Hours"
            onPress={async () => {
              const trimmed = extracurricularHours.trim();
              if (!trimmed) {
                Alert.alert('Missing Value', 'Please enter a number of hours.');
                return;
              }
              const num = parseFloat(trimmed);
              if (isNaN(num) || num < 0 || num > 10000) {
                Alert.alert('Invalid Hours', 'Hours must be between 0 and 10,000.');
                return;
              }
              try {
                await AsyncStorage.setItem('@duke_extracurricular_hours', trimmed);
                Alert.alert('Saved', `${trimmed} extracurricular hours recorded.`);
              } catch (error) {
                console.error('Failed to save extracurricular hours:', error);
                Alert.alert('Error', 'Failed to save hours. Please try again.');
              }
            }}
            variant="secondary"
            style={staticStyles.scoreSaveButton}
            accessibilityLabel="Save extracurricular hours"
          />
        </VCard>

        {/* Summary */}
        <View style={staticStyles.metricsRow}>
          <VMetricCard
            value={String(entries.length)}
            label="Total Entries"
            style={staticStyles.metricCard}
            accessibilityLabel={`${entries.length} leadership entries`}
          />
          <VMetricCard
            value={String(commandRoles.length)}
            label="Command Roles"
            style={staticStyles.metricCard}
            accessibilityLabel={`${commandRoles.length} command roles`}
          />
        </View>

        {/* Add Entry */}
        {!showForm ? (
          <VButton
            label="Add Entry"
            onPress={() => setShowForm(true)}
            variant="secondary"
            style={staticStyles.addButton}
            accessibilityLabel="Add a new leadership entry"
          />
        ) : (
          <VCard tier="low" style={staticStyles.formCard}>
            <Text style={styles.formTitle}>New Leadership Entry</Text>

            {/* Type Selector */}
            <Text style={styles.typeLabel}>Type</Text>
            <View style={staticStyles.typeRow}>
              {ENTRY_TYPES.map((type) => (
                <VButton
                  key={type}
                  label={type}
                  onPress={() => setEntryType(type)}
                  variant={entryType === type ? 'primary' : 'secondary'}
                  style={staticStyles.typeButton}
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

            <View style={staticStyles.formActions}>
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
              <VCard key={entry.id} tier="low" style={staticStyles.entryCard}>
                <View style={staticStyles.entryHeader}>
                  <View style={staticStyles.entryInfo}>
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
              <VCard key={entry.id} tier="low" style={staticStyles.entryCard}>
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
              <VCard key={entry.id} tier="low" style={staticStyles.entryCard}>
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
              <VCard key={entry.id} tier="low" style={staticStyles.entryCard}>
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

// Static styles (no color dependencies)
const staticStyles = StyleSheet.create({
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
  scoreSection: {
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  scoreRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  scoreInputHalf: {
    flex: 1,
  },
  scoreSaveButton: {
    marginTop: spacing[1],
  },
});

// Theme-dependent styles
function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
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
    formTitle: {
      ...typography.title_md,
      color: colors.on_surface,
    },
    typeLabel: {
      ...typography.label_md,
      color: colors.on_surface,
    },
    sectionTitle: {
      ...typography.title_md,
      color: colors.on_surface,
      marginBottom: spacing[3],
      marginTop: spacing[2],
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
    scoreSectionTitle: {
      ...typography.title_md,
      color: colors.on_surface,
    },
    scoreHint: {
      ...typography.body_sm,
      color: colors.outline,
      fontStyle: 'italic',
    },
  });
}
