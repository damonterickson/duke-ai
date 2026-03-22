import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  VCard,
  VButton,
  VInput,
  VProgressBar,
  VEmptyState,
  VSkeletonLoader,
} from '../../src/components';
import { colors, typography, spacing, roundness, gradients } from '../../src/theme/tokens';
import {
  getCourses,
  insertCourse,
  deleteCourse,
  type CourseRow,
} from '../../src/services/storage';
import { generateMicroInsight } from '../../src/services/ai';

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, A: 4.0, 'A-': 3.7,
  'B+': 3.3, B: 3.0, 'B-': 2.7,
  'C+': 2.3, C: 2.0, 'C-': 1.7,
  'D+': 1.3, D: 1.0, 'D-': 0.7,
  F: 0.0,
};

function getQualityPoints(grade: string, credits: number): number {
  const gp = GRADE_POINTS[grade.toUpperCase()] ?? 0;
  return parseFloat((gp * credits).toFixed(1));
}

export default function AcademicsScreen() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('');
  const [grade, setGrade] = useState('');
  const [isMsl, setIsMsl] = useState(false);
  const [semester, setSemester] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const rows = await getCourses();
      setCourses(rows);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
    setIsLoaded(true);
  }

  function calculateGPA(courseList: CourseRow[]): number {
    if (courseList.length === 0) return 0;
    const totalCredits = courseList.reduce((sum, c) => sum + c.credits, 0);
    if (totalCredits === 0) return 0;
    const totalPoints = courseList.reduce((sum, c) => {
      const gp = GRADE_POINTS[c.grade.toUpperCase()] ?? 0;
      return sum + gp * c.credits;
    }, 0);
    return totalPoints / totalCredits;
  }

  function calculateMslGPA(courseList: CourseRow[]): number {
    const mslCourses = courseList.filter((c) => c.is_msl === 1);
    return calculateGPA(mslCourses);
  }

  async function handleAddCourse() {
    if (!code.trim() || !name.trim() || !credits.trim() || !grade.trim() || !semester.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    const gradeUpper = grade.toUpperCase().trim();
    if (!(gradeUpper in GRADE_POINTS)) {
      Alert.alert('Invalid Grade', 'Please enter a valid letter grade (A+, A, A-, B+, etc.).');
      return;
    }
    const creditsNum = parseFloat(credits);
    if (isNaN(creditsNum) || creditsNum <= 0) {
      Alert.alert('Invalid Credits', 'Credits must be a positive number.');
      return;
    }

    try {
      // Calculate GPA before adding the course
      const gpaBefore = calculateGPA(courses);
      const mslGpaBefore = calculateMslGPA(courses);

      await insertCourse({
        code: code.trim(),
        name: name.trim(),
        credits: creditsNum,
        grade: gradeUpper,
        is_msl: isMsl ? 1 : 0,
        semester: semester.trim(),
      });

      const courseCode = code.trim();
      const courseGrade = gradeUpper;

      setCode('');
      setName('');
      setCredits('');
      setGrade('');
      setIsMsl(false);
      setSemester('');
      setShowForm(false);
      await loadCourses();

      // Calculate GPA after adding the course
      const updatedCourses = await getCourses();
      const gpaAfter = calculateGPA(updatedCourses);
      const gpaDelta = Math.round((gpaAfter - gpaBefore) * 100) / 100;

      // Show post-entry micro-insight
      const mslLabel = isMsl ? ' (MSL)' : '';
      const deltaText = gpaDelta !== 0
        ? ` GPA: ${gpaBefore.toFixed(2)} -> ${gpaAfter.toFixed(2)}`
        : '';
      Alert.alert(
        'Course Added',
        `${courseCode} (${courseGrade})${mslLabel} saved.${deltaText}`
      );

      // Fire-and-forget AI enhancement
      generateMicroInsight(
        '{}',
        `added course ${courseCode} with grade ${courseGrade}${mslLabel}`,
        gpaDelta * 10 // rough OML impact estimate
      )
        .then((insight) => {
          if (insight) {
            Alert.alert('Vanguard AI', insight);
          }
        })
        .catch(() => {});
    } catch (error) {
      console.error('Failed to add course:', error);
      Alert.alert('Error', 'Failed to save course. Please try again.');
    }
  }

  async function handleDeleteCourse(id: number) {
    Alert.alert('Delete Course', 'Are you sure you want to remove this course?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCourse(id);
            await loadCourses();
          } catch (error) {
            console.error('Failed to delete course:', error);
            Alert.alert('Error', 'Failed to remove course. Please try again.');
          }
        },
      },
    ]);
  }

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContent}>
          <VSkeletonLoader width="100%" height={160} />
          <VSkeletonLoader width="100%" height={80} style={{ marginTop: spacing[3] }} />
          <VSkeletonLoader width="100%" height={60} style={{ marginTop: spacing[3] }} />
          <VSkeletonLoader width="100%" height={60} style={{ marginTop: spacing[3] }} />
        </View>
      </SafeAreaView>
    );
  }

  if (courses.length === 0 && !showForm) {
    return (
      <SafeAreaView style={styles.container}>
        <VEmptyState
          icon={'\u{1F4DA}'}
          headline="No Courses Tracked Yet"
          body="Add your courses to calculate your GPA and see how academics impact your OML score. Academic performance is 40% of your OML score."
          ctaLabel="Add Your First Course"
          onCtaPress={() => setShowForm(true)}
        />
      </SafeAreaView>
    );
  }

  const gpa = calculateGPA(courses);
  const mslGpa = calculateMslGPA(courses);
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const academicEstimate = Math.min((gpa / 4.0) * 40, 40);

  // Separate MSL courses for highlight treatment
  const mslCourses = courses.filter((c) => c.is_msl === 1);
  const otherCourses = courses.filter((c) => c.is_msl !== 1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: Dark Olive Status Plate */}
        <LinearGradient
          colors={['rgba(75, 83, 32, 0.9)', 'rgba(52, 60, 10, 0.95)']}
          style={styles.heroPlate}
        >
          {/* Tactical HUD decoration */}
          <View style={styles.hudDecor}>
            <MaterialIcons name="gps-fixed" size={100} color="rgba(255,255,255,0.06)" />
          </View>

          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>ACADEMIC INTELLIGENCE</Text>
              <Text style={styles.heroTitle}>SOVEREIGN{'\n'}TRACKER</Text>
            </View>
          </View>

          <View style={styles.heroBottomRow}>
            <View>
              <Text style={styles.heroGpaLabel}>CUMULATIVE GPA</Text>
              <Text
                style={styles.heroGpaValue}
                accessibilityLabel={`Cumulative GPA: ${gpa.toFixed(2)} out of 4.0`}
              >
                {gpa.toFixed(2)}
              </Text>
            </View>
            <View style={styles.heroRankingBadge}>
              <Text style={styles.heroRankingLabel}>OML ACADEMIC</Text>
              <Text style={styles.heroRankingValue}>
                {academicEstimate.toFixed(1)}/40 PTS
              </Text>
            </View>
          </View>

          {/* MSL GPA if applicable */}
          {courses.some((c) => c.is_msl === 1) && (
            <Text style={styles.heroMslGpa}>MSL GPA: {mslGpa.toFixed(2)}</Text>
          )}
        </LinearGradient>

        {/* Mission Courses Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>MISSION COURSES</Text>
            <Text style={styles.sectionSubtitle}>
              {courses.length} course{courses.length !== 1 ? 's' : ''} {'\u2022'} {totalCredits} credits
            </Text>
          </View>
          {!showForm && (
            <Pressable
              onPress={() => setShowForm(true)}
              style={styles.refreshButton}
              accessibilityRole="button"
              accessibilityLabel="Add a new course"
            >
              <MaterialIcons name="add-circle" size={14} color={colors.primary} />
              <Text style={styles.refreshButtonText}>ADD COURSE</Text>
            </Pressable>
          )}
        </View>

        {/* Add Course Form */}
        {showForm && (
          <VCard tier="low" style={styles.formCard}>
            <Text style={styles.formTitle}>New Course</Text>
            <VInput
              label="Course Code"
              value={code}
              onChangeText={setCode}
              placeholder="MSL 301"
              accessibilityLabel="Course code input"
            />
            <VInput
              label="Course Name"
              value={name}
              onChangeText={setName}
              placeholder="Adaptive Team Leadership"
              accessibilityLabel="Course name input"
            />
            <View style={styles.formRow}>
              <VInput
                label="Credits"
                value={credits}
                onChangeText={setCredits}
                placeholder="3"
                keyboardType="numeric"
                style={styles.halfInput}
                accessibilityLabel="Credit hours input"
              />
              <VInput
                label="Grade"
                value={grade}
                onChangeText={setGrade}
                placeholder="A"
                style={styles.halfInput}
                accessibilityLabel="Grade input"
              />
            </View>
            <VInput
              label="Semester"
              value={semester}
              onChangeText={setSemester}
              placeholder="Fall 2025"
              accessibilityLabel="Semester input"
            />
            <VButton
              label={isMsl ? 'ROTC Core (tap to toggle)' : 'General Course (tap to toggle)'}
              onPress={() => setIsMsl(!isMsl)}
              variant="tertiary"
              accessibilityLabel={`Toggle MSL designation. Currently ${isMsl ? 'ROTC Core' : 'General'}`}
            />
            <View style={styles.formActions}>
              <VButton
                label="Cancel"
                onPress={() => setShowForm(false)}
                variant="tertiary"
              />
              <VButton label="Save Course" onPress={handleAddCourse} />
            </View>
          </VCard>
        )}

        {/* MSL Courses — Highlighted Full-Width */}
        {mslCourses.map((course) => (
          <View key={course.id} style={styles.mslCard}>
            <View style={styles.mslRow}>
              <View style={styles.mslIconBox}>
                <MaterialIcons name="shield" size={28} color={colors.on_primary} />
              </View>
              <View style={styles.mslInfo}>
                <Text style={styles.mslCategoryLabel}>ROTC CORE REQUIREMENT</Text>
                <Text style={styles.mslCourseName}>
                  {course.code}: {course.name.toUpperCase()}
                </Text>
                <Text style={styles.mslMeta}>
                  Credits: {course.credits}
                  {course.semester ? ` \u2022 ${course.semester}` : ''}
                </Text>
              </View>
              <View style={styles.mslGradeBox}>
                <Text style={styles.mslGrade}>{course.grade}</Text>
                <Text style={styles.mslGradeLabel}>GRADE</Text>
              </View>
            </View>
            <View style={styles.courseFooter}>
              <VButton
                label="Remove"
                onPress={() => course.id != null && handleDeleteCourse(course.id)}
                variant="tertiary"
                accessibilityLabel={`Remove ${course.code}`}
              />
            </View>
          </View>
        ))}

        {/* Other Courses — Glass Cards */}
        {otherCourses.map((course) => {
          const gradePoints = GRADE_POINTS[course.grade.toUpperCase()] ?? 0;

          return (
            <View key={course.id} style={styles.glassCard}>
              <View style={styles.glassCardRow}>
                <View style={styles.glassCardLeft}>
                  <Text style={styles.glassCategory}>
                    {course.semester ?? 'Course'}
                  </Text>
                  <Text style={styles.glassCourseName}>
                    {course.code}: {course.name.toUpperCase()}
                  </Text>
                  <Text style={styles.glassMeta}>{course.credits} Credits</Text>
                </View>
                <Text style={[
                  styles.glassGrade,
                  gradePoints >= 3.7 ? styles.gradeHigh : styles.gradeMid,
                ]}>
                  {course.grade}
                </Text>
              </View>
              <View style={styles.courseFooter}>
                <VButton
                  label="Remove"
                  onPress={() => course.id != null && handleDeleteCourse(course.id)}
                  variant="tertiary"
                  accessibilityLabel={`Remove ${course.code}`}
                />
              </View>
            </View>
          );
        })}

        {/* OML Projections */}
        <VCard tier="low" style={styles.omlCard}>
          <Text style={styles.omlTitle}>OML PROJECTIONS</Text>

          <View style={styles.omlPillar}>
            <View style={styles.omlPillarRow}>
              <Text style={styles.omlPillarLabel}>Academics (40%)</Text>
              <Text style={styles.omlPillarValue}>{academicEstimate.toFixed(1)}/40</Text>
            </View>
            <VProgressBar
              progress={Math.min(academicEstimate / 40, 1)}
              accessibilityLabel={`Academic pillar: ${academicEstimate.toFixed(1)} of 40`}
            />
          </View>

          <View style={styles.omlPillar}>
            <View style={styles.omlPillarRow}>
              <Text style={styles.omlPillarLabel}>Leadership (40%)</Text>
              {/* TODO: wire to real data */}
              <Text style={styles.omlPillarValue}>--/40</Text>
            </View>
            <VProgressBar progress={0} accessibilityLabel="Leadership pillar: not yet calculated" />
          </View>

          <View style={styles.omlPillar}>
            <View style={styles.omlPillarRow}>
              <Text style={styles.omlPillarLabel}>Physical (20%)</Text>
              {/* TODO: wire to real data */}
              <Text style={styles.omlPillarValue}>--/20</Text>
            </View>
            <VProgressBar progress={0} accessibilityLabel="Physical pillar: not yet calculated" />
          </View>

          <View style={styles.omlInsight}>
            <Text style={styles.omlInsightText}>
              Maintaining a{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>
                {gpa.toFixed(2)} GPA
              </Text>
              {' '}contributes{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>
                {academicEstimate.toFixed(1)} points
              </Text>
              {' '}to your OML score. A decrease of 0.1 GPA may drop OML standing by ~4 spots.
            </Text>
          </View>
        </VCard>

        {/* Secondary Stats */}
        <View style={styles.statsGrid}>
          <VCard tier="low" style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL CREDITS</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{totalCredits}</Text>
              <Text style={styles.statSuffix}>/ 120</Text>
            </View>
          </VCard>
          <VCard tier="low" style={styles.statCard}>
            <Text style={styles.statLabel}>DEAN'S LIST</Text>
            <View style={styles.statValueRow}>
              {/* TODO: compute from semester history */}
              <Text style={styles.statValue}>{'\u2014'}</Text>
            </View>
          </VCard>
        </View>
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

  // Hero: Dark Olive Status Plate
  heroPlate: {
    padding: spacing[6],
    borderRadius: roundness.sm,
    marginBottom: spacing[6],
    overflow: 'hidden',
    position: 'relative',
  },
  hudDecor: {
    position: 'absolute',
    top: -20,
    right: -20,
  },
  heroTopRow: {
    marginBottom: spacing[6],
  },
  heroLabel: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: 'rgba(189, 199, 135, 0.8)', // on_primary_container muted
    marginBottom: spacing[2],
  },
  heroTitle: {
    fontFamily: typography.display_lg.fontFamily,
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    lineHeight: 38,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroGpaLabel: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(189, 199, 135, 0.8)',
    marginBottom: spacing[1],
  },
  heroGpaValue: {
    fontFamily: typography.display_lg.fontFamily,
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -2,
  },
  heroRankingBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: spacing[3],
    borderRadius: roundness.sm,
  },
  heroRankingLabel: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(189, 199, 135, 0.7)',
    marginBottom: spacing[1],
  },
  heroRankingValue: {
    fontFamily: typography.title_sm.fontFamily,
    fontSize: typography.title_sm.fontSize,
    fontWeight: '700',
    color: colors.tertiary_container,
  },
  heroMslGpa: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: typography.label_sm.fontSize,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginTop: spacing[3],
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontFamily: typography.headline_md.fontFamily,
    fontSize: typography.headline_md.fontSize,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    ...typography.label_sm,
    color: colors.outline,
    marginTop: spacing[1],
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.surface_container_highest,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: roundness.sm,
  },
  refreshButtonText: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.primary,
  },

  // Form
  formCard: {
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  formTitle: {
    ...typography.title_md,
    color: colors.on_surface,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  halfInput: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[3],
    marginTop: spacing[2],
  },

  // MSL Highlight Card
  mslCard: {
    backgroundColor: 'rgba(245, 243, 243, 0.7)',
    padding: spacing[5],
    borderRadius: roundness.sm,
    marginBottom: spacing[3],
  },
  mslRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  mslIconBox: {
    width: 52,
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: roundness.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mslInfo: {
    flex: 1,
  },
  mslCategoryLabel: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: spacing[1],
  },
  mslCourseName: {
    fontFamily: typography.headline_md.fontFamily,
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  mslMeta: {
    ...typography.label_sm,
    color: colors.outline,
    marginTop: spacing[1],
  },
  mslGradeBox: {
    alignItems: 'center',
  },
  mslGrade: {
    fontFamily: typography.display_lg.fontFamily,
    fontSize: 40,
    fontWeight: '900',
    color: colors.primary,
  },
  mslGradeLabel: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.outline,
  },

  // Glass Course Cards
  glassCard: {
    backgroundColor: 'rgba(245, 243, 243, 0.7)',
    padding: spacing[5],
    borderRadius: roundness.sm,
    marginBottom: spacing[3],
  },
  glassCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassCardLeft: {
    flex: 1,
  },
  glassCategory: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.outline,
    marginBottom: spacing[1],
  },
  glassCourseName: {
    fontFamily: typography.headline_md.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  glassMeta: {
    ...typography.label_sm,
    color: colors.outline,
    marginTop: spacing[1],
  },
  glassGrade: {
    fontFamily: typography.headline_md.fontFamily,
    fontSize: 28,
    fontWeight: '900',
  },
  gradeHigh: {
    color: colors.primary,
  },
  gradeMid: {
    color: colors.primary,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing[2],
  },

  // OML Projections
  omlCard: {
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  omlTitle: {
    fontFamily: typography.headline_md.fontFamily,
    fontSize: typography.title_md.fontSize,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.3,
    marginBottom: spacing[5],
  },
  omlPillar: {
    marginBottom: spacing[4],
  },
  omlPillarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing[2],
  },
  omlPillarLabel: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.outline,
  },
  omlPillarValue: {
    fontFamily: typography.title_sm.fontFamily,
    fontSize: typography.title_sm.fontSize,
    fontWeight: '700',
    color: colors.primary,
  },
  omlInsight: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 199, 184, 0.2)',
  },
  omlInsightText: {
    ...typography.body_sm,
    color: colors.outline,
    lineHeight: 20,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.outline,
    marginBottom: spacing[3],
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[2],
  },
  statValue: {
    fontFamily: typography.headline_md.fontFamily,
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  statSuffix: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '600',
    color: colors.outline,
  },
});
