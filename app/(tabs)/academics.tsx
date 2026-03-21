import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {
  VMetricCard,
  VCard,
  VButton,
  VInput,
  VEmptyState,
  VSkeletonLoader,
} from '../../src/components';
import { colors, typography, spacing, roundness } from '../../src/theme/tokens';
import { useScoresStore } from '../../src/stores/useScoresStore';
import { useProfileStore } from '../../src/stores/useProfileStore';
import { calculateOML, Course } from '../../src/engine/oml';

const GRADE_MAP: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

export default function AcademicsScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const { academic, physical, leadership, loaded, addCourse, deleteCourse } = useScoresStore();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCredits, setCourseCredits] = useState('');
  const [courseGrade, setCourseGrade] = useState('');

  const omlResult = calculateOML(profile, academic, physical, leadership);

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ padding: spacing.md }}>
          <VSkeletonLoader height={80} />
          <VSkeletonLoader lines={4} style={{ marginTop: spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleAddCourse = async () => {
    const credits = parseFloat(courseCredits);
    const gradePoints = GRADE_MAP[courseGrade.toUpperCase()];

    if (!courseCode.trim()) return Alert.alert('Error', 'Course code is required.');
    if (!courseName.trim()) return Alert.alert('Error', 'Course name is required.');
    if (isNaN(credits) || credits <= 0) return Alert.alert('Error', 'Enter valid credits.');
    if (gradePoints === undefined) return Alert.alert('Error', 'Enter a valid grade (A+, A, A-, B+, etc.).');

    const course: Course = {
      id: `course_${Date.now()}`,
      code: courseCode.trim().toUpperCase(),
      name: courseName.trim(),
      credits,
      grade: courseGrade.toUpperCase(),
      gradePoints,
    };

    await addCourse(course);
    setCourseCode('');
    setCourseName('');
    setCourseCredits('');
    setCourseGrade('');
    setAddModalVisible(false);
  };

  const handleDeleteCourse = (id: string, code: string) => {
    Alert.alert('Delete Course', `Remove ${code}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCourse(id) },
    ]);
  };

  // Calculate OML impact for each course
  const getOMLImpact = (course: Course): string => {
    const totalCredits = academic.courses.reduce((s, c) => s + c.credits, 0);
    if (totalCredits === 0) return '--';
    const contribution = (course.gradePoints * course.credits) / totalCredits;
    const impactOnPillar = (contribution / 4.0) * 40;
    return impactOnPillar.toFixed(1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Academic Tracker</Text>

        {/* GPA Metric */}
        <VMetricCard
          label="Cumulative GPA"
          value={academic.gpa > 0 ? academic.gpa.toFixed(2) : '--'}
          subtitle={academic.gpa > 0 ? `/4.00 — ${omlResult.academic.weighted}/${omlResult.academic.max} OML pts` : 'No courses tracked'}
          style={styles.gpaCard}
          accessibilityLabel={`GPA: ${academic.gpa.toFixed(2)} out of 4.00`}
        />

        {/* Course List */}
        {academic.courses.length === 0 ? (
          <VEmptyState
            icon="school"
            title="No courses tracked yet"
            subtitle="Add your courses to calculate your GPA and see its impact on your OML score."
            actionLabel="Add Your First Course"
            onAction={() => setAddModalVisible(true)}
          />
        ) : (
          <>
            {academic.courses.map((course) => (
              <VCard key={course.id} variant="outlined" style={styles.courseCard}>
                <View style={styles.courseRow}>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseCode}>{course.code}</Text>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseDetail}>
                      {course.credits} credits | Grade: {course.grade} | OML impact: {getOMLImpact(course)} pts
                    </Text>
                  </View>
                  <View style={styles.courseActions}>
                    <Text style={styles.courseGrade}>{course.grade}</Text>
                    <Pressable
                      onPress={() => handleDeleteCourse(course.id, course.code)}
                      accessibilityLabel={`Delete ${course.code}`}
                      accessibilityRole="button"
                      hitSlop={12}
                      style={styles.deleteButton}
                    >
                      <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              </VCard>
            ))}
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <VButton
            title="Add Course"
            onPress={() => setAddModalVisible(true)}
            variant="filled"
            icon={<MaterialIcons name="add" size={18} color={colors.onPrimary} />}
            accessibilityLabel="Add a new course"
          />
          <VButton
            title="Simulate GPA"
            onPress={() => router.push('/what-if')}
            variant="outlined"
            icon={<MaterialIcons name="tune" size={18} color={colors.primary} />}
            accessibilityLabel="Open GPA simulator"
          />
        </View>
      </ScrollView>

      {/* Add Course Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Course</Text>
            <Pressable
              onPress={() => setAddModalVisible(false)}
              accessibilityLabel="Close"
              accessibilityRole="button"
              style={styles.modalClose}
            >
              <MaterialIcons name="close" size={24} color={colors.onSurface} />
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <VInput
              label="Course Code"
              value={courseCode}
              onChangeText={setCourseCode}
              placeholder="e.g. MATH 201"
              accessibilityLabel="Course code"
            />
            <VInput
              label="Course Name"
              value={courseName}
              onChangeText={setCourseName}
              placeholder="e.g. Calculus II"
              accessibilityLabel="Course name"
            />
            <VInput
              label="Credits"
              value={courseCredits}
              onChangeText={setCourseCredits}
              placeholder="e.g. 3"
              keyboardType="decimal-pad"
              accessibilityLabel="Course credits"
            />
            <VInput
              label="Grade"
              value={courseGrade}
              onChangeText={setCourseGrade}
              placeholder="e.g. A, B+, C-"
              accessibilityLabel="Course grade"
            />

            <VButton
              title="Add Course"
              onPress={handleAddCourse}
              variant="filled"
              style={{ marginTop: spacing.md }}
              accessibilityLabel="Confirm add course"
            />
          </View>
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
  gpaCard: {
    marginBottom: spacing.lg,
  },
  courseCard: {
    marginBottom: spacing.sm,
  },
  courseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  courseCode: {
    ...typography.titleSmall,
    color: colors.onSurface,
  },
  courseName: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  courseDetail: {
    ...typography.bodySmall,
    color: colors.outline,
    marginTop: 4,
  },
  courseActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  courseGrade: {
    ...typography.titleLarge,
    color: colors.primary,
    fontWeight: '700',
  },
  deleteButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
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
});
