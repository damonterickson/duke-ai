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
import {
  VCard,
  VButton,
  VInput,
  VProgressBar,
  VInsightCard,
  VEmptyState,
  VSkeletonLoader,
} from '../../src/components';
import { colors, typography, spacing, roundness } from '../../src/theme/tokens';
import {
  getCourses,
  insertCourse,
  deleteCourse,
  type CourseRow,
} from '../../src/services/storage';

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, A: 4.0, 'A-': 3.7,
  'B+': 3.3, B: 3.0, 'B-': 2.7,
  'C+': 2.3, C: 2.0, 'C-': 1.7,
  'D+': 1.3, D: 1.0, 'D-': 0.7,
  F: 0.0,
};

/** Quality points this course contributes to GPA (grade_point * credits). */
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
      await insertCourse({
        code: code.trim(),
        name: name.trim(),
        credits: creditsNum,
        grade: gradeUpper,
        is_msl: isMsl ? 1 : 0,
        semester: semester.trim(),
      });
      setCode('');
      setName('');
      setCredits('');
      setGrade('');
      setIsMsl(false);
      setSemester('');
      setShowForm(false);
      await loadCourses();
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
          <VSkeletonLoader width="100%" height={120} />
          <VSkeletonLoader width="100%" height={80} style={{ marginTop: spacing[3] }} />
          <VSkeletonLoader width="100%" height={48} style={{ marginTop: spacing[3] }} />
          <VSkeletonLoader width="100%" height={48} style={{ marginTop: spacing[3] }} />
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
  const gpaPercent = Math.min((gpa / 4.0) * 100, 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header} accessibilityRole="header">
          Academic Tracker
        </Text>

        {/* Hero GPA Card */}
        <VCard tier="lowest" style={styles.heroCard}>
          <MaterialIcons
            name="school"
            size={120}
            color={colors.outline}
            style={styles.heroBgIcon}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>ACADEMIC STANDING</Text>
            <View style={styles.heroGpaRow}>
              <Text
                style={styles.heroGpaValue}
                accessibilityLabel={`Cumulative GPA: ${gpa.toFixed(2)} out of 4.0`}
              >
                {gpa.toFixed(2)}
              </Text>
              <Text style={styles.heroGpaSuffix}>/ 4.0</Text>
            </View>

            {/* MSL GPA inline — show whenever MSL courses exist */}
            {courses.some((c) => c.is_msl === 1) && (
              <Text style={styles.mslGpaText}>MSL GPA: {mslGpa.toFixed(2)}</Text>
            )}

            {/* Progress to 4.0 */}
            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>PROGRESS TO 4.0</Text>
                <Text style={styles.progressValue}>{gpaPercent.toFixed(1)}%</Text>
              </View>
              <VProgressBar
                progress={gpa / 4.0}
                accessibilityLabel={`GPA progress: ${gpaPercent.toFixed(1)} percent of 4.0`}
              />
            </View>
          </View>
        </VCard>

        {/* AI Insight */}
        <VInsightCard
          icon="psychology"
          label="AI Insight"
          text="Focus on your highest-credit courses for maximum GPA impact. An A in a 4-credit course moves the needle more than an A+ in a 1-credit elective."
          style={styles.insightCard}
        />

        {/* Course Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Current Courses</Text>
            <Text style={styles.sectionSubtitle}>
              {courses.length} course{courses.length !== 1 ? 's' : ''} {'\u2022'} {totalCredits} credits
            </Text>
          </View>
          {!showForm && (
            <Pressable
              onPress={() => setShowForm(true)}
              style={styles.addCourseButton}
              accessibilityRole="button"
              accessibilityLabel="Add a new course"
            >
              <MaterialIcons name="add-circle" size={16} color={colors.primary} />
              <Text style={styles.addCourseText}>ADD COURSE</Text>
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
              placeholder="Military Leadership"
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
              label={isMsl ? 'MSL Course (tap to toggle)' : 'Non-MSL Course (tap to toggle)'}
              onPress={() => setIsMsl(!isMsl)}
              variant="tertiary"
              accessibilityLabel={`Toggle MSL designation. Currently ${isMsl ? 'MSL' : 'non-MSL'}`}
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

        {/* Course Cards */}
        {courses.map((course) => {
          const qp = getQualityPoints(course.grade, course.credits);
          const gradePoints = GRADE_POINTS[course.grade.toUpperCase()] ?? 0;
          const isHighImpact = gradePoints >= 3.7;

          return (
            <VCard
              key={course.id}
              tier="low"
              style={styles.courseCard}
              accessibilityLabel={`${course.code} ${course.name}, Grade: ${course.grade}, Credits: ${course.credits}${course.is_msl ? ', MSL course' : ''}, Quality Points: ${qp}`}
            >
              <View style={styles.courseHeader}>
                <View style={styles.courseLeft}>
                  {/* Course Code Badge */}
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeBadgeText}>{course.code}</Text>
                  </View>
                  <Text style={styles.courseName}>{course.name}</Text>
                  <Text style={styles.courseCredits}>
                    {course.credits} Credits
                    {course.is_msl === 1 ? ' \u2022 MSL' : ''}{course.semester ? ` \u2022 ${course.semester}` : ''}
                  </Text>
                </View>
                <View style={styles.courseRight}>
                  {/* Grade */}
                  <Text style={[
                    styles.gradeText,
                    isHighImpact ? styles.gradeHigh : styles.gradeMid,
                  ]}>
                    {course.grade}
                  </Text>
                  {/* OML Impact */}
                  <View style={styles.impactRow}>
                    <MaterialIcons
                      name="stars"
                      size={14}
                      color={isHighImpact ? colors.tertiary : colors.outline}
                    />
                    <Text style={[
                      styles.impactText,
                      isHighImpact ? styles.impactHigh : styles.impactMid,
                    ]}>
                      {qp} QP
                    </Text>
                  </View>
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
            </VCard>
          );
        })}

        {/* Secondary Stats */}
        <Text style={[styles.sectionTitle, { marginTop: spacing[4] }]}>Progress</Text>
        <View style={styles.statsGrid}>
          <VCard tier="low" style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL CREDITS</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{totalCredits}</Text>
              <Text style={styles.statSuffix}>/ 120 REQ</Text>
            </View>
          </VCard>
          <VCard tier="low" style={styles.statCard}>
            <Text style={styles.statLabel}>DEAN'S LIST</Text>
            <View style={styles.statValueRow}>
              {/* TODO: compute from semester history */}
              <Text style={styles.statValue}>{'\u2014'}</Text>
              <Text style={styles.statSuffix}>CONSECUTIVE</Text>
            </View>
          </VCard>
          <VCard tier="low" style={styles.statCard}>
            <Text style={styles.statLabel}>STEM BONUS</Text>
            <View style={styles.statValueRow}>
              {/* TODO: detect from course codes */}
              <Text style={[styles.statValue, { color: colors.tertiary }]}>{'\u2014'}</Text>
            </View>
          </VCard>
          {/* Upload Transcript placeholder */}
          <Pressable
            style={styles.uploadCard}
            onPress={() => Alert.alert('Coming Soon', 'Transcript upload will be available in a future update.')}
            accessibilityRole="button"
            accessibilityLabel="Upload transcript"
          >
            <MaterialIcons name="upload-file" size={24} color={colors.primary} />
            <Text style={styles.uploadText}>UPLOAD TRANSCRIPT</Text>
          </Pressable>
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
  header: {
    ...typography.headline_lg,
    color: colors.on_surface,
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },

  // Hero GPA Card
  heroCard: {
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  heroBgIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    opacity: 0.06,
  },
  heroContent: {
    position: 'relative',
  },
  heroLabel: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: typography.label_sm.fontSize,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.secondary,
    marginBottom: spacing[2],
  },
  heroGpaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[2],
  },
  heroGpaValue: {
    fontFamily: typography.display_lg.fontFamily,
    fontSize: 56,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -2,
  },
  heroGpaSuffix: {
    fontFamily: typography.headline_md.fontFamily,
    fontSize: typography.headline_md.fontSize,
    fontWeight: '700',
    color: colors.outline,
  },
  mslGpaText: {
    ...typography.label_md,
    color: colors.outline,
    marginTop: spacing[1],
  },
  progressSection: {
    marginTop: spacing[6],
    gap: spacing[2],
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.outline,
  },
  progressValue: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.primary,
  },

  // Insight
  insightCard: {
    marginBottom: spacing[6],
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    ...typography.title_md,
    color: colors.on_surface,
  },
  sectionSubtitle: {
    ...typography.label_sm,
    color: colors.outline,
    marginTop: spacing[1],
  },
  addCourseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.surface_container_high,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: roundness.lg,
  },
  addCourseText: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
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

  // Course Cards
  courseCard: {
    marginBottom: spacing[3],
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseLeft: {
    flex: 1,
    gap: spacing[1],
  },
  codeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary_container,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: roundness.sm,
    marginBottom: spacing[1],
  },
  codeBadgeText: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
  },
  courseName: {
    ...typography.title_sm,
    color: colors.on_surface,
  },
  courseCredits: {
    ...typography.label_sm,
    color: colors.outline,
  },
  courseRight: {
    alignItems: 'flex-end',
    gap: spacing[1],
  },
  gradeText: {
    fontFamily: typography.headline_md.fontFamily,
    fontSize: 24,
    fontWeight: '900',
  },
  gradeHigh: {
    color: colors.primary,
  },
  gradeMid: {
    color: colors.secondary,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  impactText: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: typography.label_sm.fontSize,
    fontWeight: '700',
  },
  impactHigh: {
    color: colors.tertiary,
  },
  impactMid: {
    color: colors.outline,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing[2],
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginTop: spacing[3],
  },
  statCard: {
    width: '47%',
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
  uploadCard: {
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    borderRadius: roundness.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outline_variant + '4D', // 30% opacity via hex alpha
    gap: spacing[2],
  },
  uploadText: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.primary,
    textAlign: 'center',
  },
});
