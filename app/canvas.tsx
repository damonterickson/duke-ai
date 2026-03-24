import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../src/theme/tokens';
import { VGlassPanel, VButton } from '../src/components';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface CanvasCourse {
  id: string;
  name: string;
  code: string;
  grade: string | null;
  credits: number;
  isMilScience: boolean;
}

// Placeholder courses shown when connected (demo data)
const DEMO_COURSES: CanvasCourse[] = [
  { id: '1', name: 'Military Science III', code: 'MSL 301', grade: 'A', credits: 3, isMilScience: true },
  { id: '2', name: 'Advanced Leadership Lab', code: 'MSL 302', grade: 'A-', credits: 1, isMilScience: true },
  { id: '3', name: 'Introduction to Engineering', code: 'EGR 101', grade: 'B+', credits: 4, isMilScience: false },
  { id: '4', name: 'American History', code: 'HIST 201', grade: 'A-', credits: 3, isMilScience: false },
  { id: '5', name: 'Calculus II', code: 'MATH 202', grade: 'B', credits: 4, isMilScience: false },
];

export default function CanvasIntegrationScreen() {
  const router = useRouter();
  const { colors, isDark, glass, ghostBorder } = useTheme();

  const headerBg = isDark ? colors.surface_container_high : '#343c0a';

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [autoSync, setAutoSync] = useState(false);

  const handleConnect = useCallback(() => {
    Alert.alert(
      'Connect to Canvas LMS',
      'You\'ll need your Canvas API token from your university\'s Canvas instance. Go to Canvas > Account > Settings > New Access Token.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enter Token',
          onPress: () => {
            setStatus('connecting');
            // Simulate connection
            setTimeout(() => {
              setStatus('connected');
              setCourses(DEMO_COURSES);
            }, 2500);
          },
        },
      ],
    );
  }, []);

  const handleDisconnect = useCallback(() => {
    Alert.alert(
      'Disconnect Canvas',
      'This will remove the Canvas integration. Your imported grades will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setStatus('disconnected');
            setCourses([]);
            setAutoSync(false);
          },
        },
      ],
    );
  }, []);

  const handleImportGrades = useCallback(() => {
    Alert.alert(
      'Import Grades',
      `Import grades from ${courses.length} courses? This will update your GPA calculation in the OML engine.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: () => {
            Alert.alert('Grades Imported', 'Your academic data has been updated.');
          },
        },
      ],
    );
  }, [courses.length]);

  const computedGPA = courses.length > 0
    ? (courses.reduce((sum, c) => {
        const gradePoints: Record<string, number> = {
          'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
          'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0,
        };
        return sum + (gradePoints[c.grade ?? ''] ?? 0) * c.credits;
      }, 0) / courses.reduce((sum, c) => sum + c.credits, 0)).toFixed(2)
    : null;

  const mslCourses = courses.filter(c => c.isMilScience);
  const mslGPA = mslCourses.length > 0
    ? (mslCourses.reduce((sum, c) => {
        const gradePoints: Record<string, number> = {
          'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
          'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0,
        };
        return sum + (gradePoints[c.grade ?? ''] ?? 0) * c.credits;
      }, 0) / mslCourses.reduce((sum, c) => sum + c.credits, 0)).toFixed(2)
    : null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: headerBg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerText}>CANVAS INTEGRATION</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.surface }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Connection Status */}
        <VGlassPanel style={styles.connectionCard}>
          <View style={styles.connectionRow}>
            <View style={[styles.statusDot, {
              backgroundColor: status === 'connected' ? '#4caf50'
                : status === 'connecting' ? colors.tertiary
                : status === 'error' ? colors.error
                : colors.outline,
            }]} />
            <View style={styles.connectionInfo}>
              <Text style={[styles.connectionTitle, { color: colors.on_surface }]}>
                Canvas LMS
              </Text>
              <Text style={[styles.connectionStatus, { color: colors.outline }]}>
                {status === 'connected' ? 'Connected - Duke University'
                  : status === 'connecting' ? 'Connecting...'
                  : status === 'error' ? 'Connection failed'
                  : 'Not connected'}
              </Text>
            </View>
            {status === 'connecting' ? (
              <ActivityIndicator color={colors.primary} />
            ) : status === 'connected' ? (
              <Pressable
                onPress={handleDisconnect}
                style={[styles.disconnectBtn, { borderColor: colors.error }]}
                accessibilityLabel="Disconnect Canvas"
              >
                <Text style={[styles.disconnectText, { color: colors.error }]}>Disconnect</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleConnect}
                style={[styles.connectBtn, { backgroundColor: colors.primary }]}
                accessibilityLabel="Connect to Canvas"
              >
                <Text style={[styles.connectText, { color: colors.on_primary }]}>Connect</Text>
              </Pressable>
            )}
          </View>
        </VGlassPanel>

        {/* Not Connected State */}
        {status === 'disconnected' && (
          <>
            <View style={styles.featureSection}>
              <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>
                What Canvas Integration Does
              </Text>
              {[
                { icon: 'school' as const, title: 'Auto-Import Grades', desc: 'Pulls your current semester grades directly into your GPA tracker.' },
                { icon: 'sync' as const, title: 'Real-Time Sync', desc: 'Grades update automatically as instructors post them.' },
                { icon: 'analytics' as const, title: 'MSL Course Detection', desc: 'Automatically identifies Military Science courses for MSL GPA calculation.' },
                { icon: 'calculate' as const, title: 'OML Impact', desc: 'See how grade changes affect your OML score in real time.' },
              ].map((feature, i) => (
                <View key={i} style={[styles.featureRow, { borderBottomColor: colors.outline_variant }]}>
                  <MaterialIcons name={feature.icon} size={24} color={colors.primary} />
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: colors.on_surface }]}>{feature.title}</Text>
                    <Text style={[styles.featureDesc, { color: colors.outline }]}>{feature.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <VGlassPanel style={styles.setupCard}>
              <Text style={[styles.setupTitle, { color: colors.on_surface }]}>Setup Instructions</Text>
              {[
                'Log into your university Canvas portal',
                'Go to Account > Settings',
                'Scroll to "Approved Integrations"',
                'Click "+ New Access Token"',
                'Name it "Duke Vanguard" and generate',
                'Copy the token and paste it here',
              ].map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary_container }]}>
                    <Text style={[styles.stepNumberText, { color: colors.on_primary_container }]}>
                      {i + 1}
                    </Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.on_surface }]}>{step}</Text>
                </View>
              ))}
            </VGlassPanel>
          </>
        )}

        {/* Connected State — Course List */}
        {status === 'connected' && courses.length > 0 && (
          <>
            {/* GPA Summary */}
            <View style={styles.gpaSummaryRow}>
              <View style={[styles.gpaCard, { backgroundColor: colors.surface_container }]}>
                <Text style={[styles.gpaLabel, { color: colors.outline }]}>CUMULATIVE GPA</Text>
                <Text style={[styles.gpaValue, { color: colors.on_surface }]}>{computedGPA}</Text>
              </View>
              <View style={[styles.gpaCard, { backgroundColor: colors.surface_container }]}>
                <Text style={[styles.gpaLabel, { color: colors.outline }]}>MSL GPA</Text>
                <Text style={[styles.gpaValue, { color: colors.on_surface }]}>{mslGPA ?? '--'}</Text>
              </View>
            </View>

            {/* Courses */}
            <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>
              Current Courses ({courses.length})
            </Text>
            {courses.map((course) => (
              <View
                key={course.id}
                style={[
                  styles.courseCard,
                  {
                    backgroundColor: glass.overlayColor,
                    borderColor: course.isMilScience ? colors.primary : ghostBorder.color,
                    borderWidth: course.isMilScience ? 1.5 : ghostBorder.width,
                  },
                ]}
              >
                <View style={styles.courseHeader}>
                  <View style={styles.courseInfo}>
                    <Text style={[styles.courseCode, { color: colors.primary }]}>{course.code}</Text>
                    <Text style={[styles.courseName, { color: colors.on_surface }]} numberOfLines={1}>
                      {course.name}
                    </Text>
                  </View>
                  <View style={styles.courseGrade}>
                    <Text style={[styles.gradeText, { color: colors.on_surface }]}>
                      {course.grade ?? '--'}
                    </Text>
                    <Text style={[styles.creditText, { color: colors.outline }]}>
                      {course.credits} cr
                    </Text>
                  </View>
                </View>
                {course.isMilScience && (
                  <View style={[styles.mslBadge, { backgroundColor: colors.primary_container }]}>
                    <MaterialIcons name="military-tech" size={12} color={colors.on_primary_container} />
                    <Text style={[styles.mslBadgeText, { color: colors.on_primary_container }]}>
                      Military Science
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {/* Auto-sync Toggle */}
            <Pressable
              style={[styles.toggleRow, { backgroundColor: colors.surface_container }]}
              onPress={() => setAutoSync(!autoSync)}
              accessibilityLabel={`Auto-sync is ${autoSync ? 'on' : 'off'}`}
              accessibilityRole="switch"
            >
              <View style={styles.toggleContent}>
                <Text style={[styles.toggleTitle, { color: colors.on_surface }]}>Auto-Sync Grades</Text>
                <Text style={[styles.toggleDesc, { color: colors.outline }]}>
                  Automatically update grades when you open the app
                </Text>
              </View>
              <View style={[
                styles.toggleSwitch,
                { backgroundColor: autoSync ? colors.primary : colors.outline_variant },
              ]}>
                <View style={[
                  styles.toggleKnob,
                  { transform: [{ translateX: autoSync ? 18 : 2 }] },
                ]} />
              </View>
            </Pressable>

            {/* Import Button */}
            <VButton
              label="Import Grades to OML Engine"
              onPress={handleImportGrades}
              style={styles.importBtn}
              accessibilityLabel="Import grades from Canvas to OML calculator"
            />
          </>
        )}
      </ScrollView>
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
  scroll: { flex: 1 },
  content: { padding: spacing[4], paddingBottom: spacing[16] },

  // Connection card
  connectionCard: { marginBottom: spacing[4] },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectionInfo: { flex: 1 },
  connectionTitle: { ...typography.title_sm },
  connectionStatus: { ...typography.body_sm, marginTop: 2 },
  connectBtn: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: roundness.md,
  },
  connectText: { ...typography.label_lg },
  disconnectBtn: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: roundness.md,
    borderWidth: 1,
  },
  disconnectText: { ...typography.label_lg },

  // Features
  featureSection: { marginBottom: spacing[4] },
  sectionTitle: { ...typography.title_md, marginBottom: spacing[3] },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 0.5,
  },
  featureContent: { flex: 1 },
  featureTitle: { ...typography.title_sm, marginBottom: 2 },
  featureDesc: { ...typography.body_sm },

  // Setup
  setupCard: { marginBottom: spacing[4] },
  setupTitle: { ...typography.title_sm, marginBottom: spacing[3] },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { ...typography.label_sm, fontWeight: '700' },
  stepText: { ...typography.body_sm, flex: 1 },

  // GPA Summary
  gpaSummaryRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  gpaCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderRadius: roundness.lg,
  },
  gpaLabel: {
    ...typography.label_sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[1],
  },
  gpaValue: { ...typography.headline_sm },

  // Course cards
  courseCard: {
    padding: spacing[3],
    borderRadius: roundness.lg,
    marginBottom: spacing[2],
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseInfo: { flex: 1, marginRight: spacing[3] },
  courseCode: {
    ...typography.label_sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  courseName: { ...typography.body_md, marginTop: 2 },
  courseGrade: { alignItems: 'flex-end' },
  gradeText: { ...typography.title_md },
  creditText: { ...typography.label_sm, marginTop: 2 },
  mslBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: roundness.sm,
    marginTop: spacing[2],
  },
  mslBadgeText: { ...typography.label_sm },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: roundness.lg,
    marginTop: spacing[3],
    marginBottom: spacing[3],
  },
  toggleContent: { flex: 1, marginRight: spacing[3] },
  toggleTitle: { ...typography.title_sm },
  toggleDesc: { ...typography.body_sm, marginTop: 2 },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },

  // Import
  importBtn: { marginTop: spacing[2] },
});
