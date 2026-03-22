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
  VEmptyState,
  VSkeletonLoader,
} from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';
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
          body="Add your courses to calculate your GPA and see how academics impact your OML score."
          ctaLabel="Add Your First Course"
          onCtaPress={() => setShowForm(true)}
        />
      </SafeAreaView>
    );
  }

  const gpa = calculateGPA(courses);
  const mslGpa = calculateMslGPA(courses);

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

        {/* GPA Summary */}
        <View style={styles.metricsRow}>
          <VMetricCard
            value={gpa.toFixed(2)}
            label="Cumulative GPA"
            style={styles.metricCard}
            accessibilityLabel={`Cumulative GPA: ${gpa.toFixed(2)}`}
          />
          <VMetricCard
            value={mslGpa.toFixed(2)}
            label="MSL GPA"
            style={styles.metricCard}
            accessibilityLabel={`Military Science GPA: ${mslGpa.toFixed(2)}`}
          />
        </View>

        {/* Add Course Button */}
        {!showForm && (
          <VButton
            label="Add Course"
            onPress={() => setShowForm(true)}
            variant="secondary"
            style={styles.addButton}
            accessibilityLabel="Add a new course"
          />
        )}

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

        {/* Course List */}
        <Text style={styles.sectionTitle}>
          Courses ({courses.length})
        </Text>
        {courses.map((course) => (
          <VCard
            key={course.id}
            tier="low"
            style={styles.courseCard}
            accessibilityLabel={`${course.code} ${course.name}, Grade: ${course.grade}, Credits: ${course.credits}${course.is_msl ? ', MSL course' : ''}`}
          >
            <View style={styles.courseHeader}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseCode}>{course.code}</Text>
                <Text style={styles.courseName}>{course.name}</Text>
              </View>
              <View style={styles.courseGrade}>
                <Text style={styles.gradeText}>{course.grade}</Text>
                <Text style={styles.creditsText}>{course.credits} cr</Text>
              </View>
            </View>
            <View style={styles.courseFooter}>
              <Text style={styles.semesterText}>
                {course.semester}
                {course.is_msl === 1 ? ' \u2022 MSL' : ''}
              </Text>
              <VButton
                label="Remove"
                onPress={() => course.id != null && handleDeleteCourse(course.id)}
                variant="tertiary"
                accessibilityLabel={`Remove ${course.code}`}
              />
            </View>
          </VCard>
        ))}
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
  sectionTitle: {
    ...typography.title_md,
    color: colors.on_surface,
    marginBottom: spacing[3],
  },
  courseCard: {
    marginBottom: spacing[3],
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    ...typography.title_sm,
    color: colors.on_surface,
  },
  courseName: {
    ...typography.body_sm,
    color: colors.outline,
    marginTop: spacing[1],
  },
  courseGrade: {
    alignItems: 'center',
  },
  gradeText: {
    ...typography.title_lg,
    color: colors.tertiary,
  },
  creditsText: {
    ...typography.label_sm,
    color: colors.outline,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  semesterText: {
    ...typography.label_sm,
    color: colors.outline,
  },
});
