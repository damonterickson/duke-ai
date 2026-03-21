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
  VEmptyState,
  VSkeletonLoader,
} from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';
import { useScoresStore } from '../../src/stores/useScoresStore';
import { useProfileStore } from '../../src/stores/useProfileStore';
import { calculateOML, LeadershipRole, Extracurricular } from '../../src/engine/oml';

export default function LeadershipScreen() {
  const profile = useProfileStore((s) => s.profile);
  const {
    academic,
    physical,
    leadership,
    loaded,
    addRole,
    deleteRole,
    addExtracurricular,
    deleteExtracurricular,
    setCSTScore,
  } = useScoresStore();

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [ecModalVisible, setEcModalVisible] = useState(false);
  const [cstModalVisible, setCstModalVisible] = useState(false);

  // Role form
  const [roleTitle, setRoleTitle] = useState('');
  const [roleUnit, setRoleUnit] = useState('');
  const [rolePoints, setRolePoints] = useState('');

  // Extracurricular form
  const [ecName, setEcName] = useState('');
  const [ecPoints, setEcPoints] = useState('');

  // CST form
  const [cstInput, setCstInput] = useState('');

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

  const handleAddRole = async () => {
    if (!roleTitle.trim()) return Alert.alert('Error', 'Role title is required.');
    const points = parseFloat(rolePoints) || 0;

    const role: LeadershipRole = {
      id: `role_${Date.now()}`,
      title: roleTitle.trim(),
      unit: roleUnit.trim(),
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      points,
    };

    await addRole(role);
    setRoleTitle('');
    setRoleUnit('');
    setRolePoints('');
    setRoleModalVisible(false);
  };

  const handleDeleteRole = (id: string, title: string) => {
    Alert.alert('Delete Role', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRole(id) },
    ]);
  };

  const handleAddEc = async () => {
    if (!ecName.trim()) return Alert.alert('Error', 'Activity name is required.');
    const points = parseFloat(ecPoints) || 0;

    const ec: Extracurricular = {
      id: `ec_${Date.now()}`,
      name: ecName.trim(),
      points,
    };

    await addExtracurricular(ec);
    setEcName('');
    setEcPoints('');
    setEcModalVisible(false);
  };

  const handleSetCST = () => {
    const score = parseFloat(cstInput);
    if (isNaN(score) || score < 0 || score > 100) {
      return Alert.alert('Error', 'Enter a CST score between 0 and 100.');
    }
    setCSTScore(score);
    setCstInput('');
    setCstModalVisible(false);
  };

  // Determine achievement badges
  const badges: Array<{ label: string; tier: 'gold' | 'silver' | 'bronze' | 'default' }> = [];
  if (leadership.totalScore >= 90) badges.push({ label: 'Elite Tier', tier: 'gold' });
  else if (leadership.totalScore >= 75) badges.push({ label: 'Gold Standard', tier: 'gold' });
  else if (leadership.totalScore >= 60) badges.push({ label: 'Strong Leader', tier: 'silver' });

  if (leadership.roles.filter((r) => r.active).length >= 3)
    badges.push({ label: 'Multi-Role', tier: 'silver' });

  const hasData = leadership.roles.length > 0 || leadership.extracurriculars.length > 0 || leadership.cstScore > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Leadership Log</Text>

        {/* Leadership Metric */}
        <VMetricCard
          label="Leadership Pillar"
          value={leadership.totalScore > 0 ? `${leadership.totalScore}` : '--'}
          subtitle={`/100 — ${omlResult.leadership.weighted}/${omlResult.leadership.max} OML pts`}
          style={styles.metricCard}
          accessibilityLabel={`Leadership score: ${leadership.totalScore} out of 100`}
        />

        {!hasData ? (
          <VEmptyState
            icon="military-tech"
            title="Your leadership journey starts here"
            subtitle="Log your CST score, leadership roles, and extracurricular activities."
            actionLabel="Log Your First Role"
            onAction={() => setRoleModalVisible(true)}
          />
        ) : (
          <>
            {/* CST Score Card */}
            <VCard
              variant="outlined"
              style={styles.cstCard}
              onPress={() => setCstModalVisible(true)}
              accessibilityLabel="Edit CST score"
            >
              <View style={styles.cstRow}>
                <View>
                  <Text style={styles.cstLabel}>CST Score</Text>
                  <Text style={styles.cstValue}>
                    {leadership.cstScore > 0 ? leadership.cstScore : 'Not set'}
                  </Text>
                </View>
                <MaterialIcons name="edit" size={20} color={colors.outline} />
              </View>
            </VCard>

            {/* Achievement Badges */}
            {badges.length > 0 && (
              <View style={styles.badgesRow}>
                {badges.map((badge, i) => (
                  <VRankBadge key={i} label={badge.label} tier={badge.tier} />
                ))}
              </View>
            )}

            {/* Roles */}
            {leadership.roles.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Leadership Roles</Text>
                {leadership.roles.map((role) => (
                  <VCard key={role.id} variant="outlined" style={styles.roleCard}>
                    <View style={styles.roleRow}>
                      <View style={styles.roleInfo}>
                        <View style={styles.roleHeader}>
                          <Text style={styles.roleTitle}>{role.title}</Text>
                          <VRankBadge
                            label={role.active ? 'Active' : 'Historical'}
                            tier={role.active ? 'gold' : 'default'}
                          />
                        </View>
                        {role.unit && <Text style={styles.roleUnit}>{role.unit}</Text>}
                        <Text style={styles.roleDate}>
                          {role.startDate}
                          {role.endDate ? ` — ${role.endDate}` : ' — Present'}
                          {' | '}{role.points} pts
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteRole(role.id, role.title)}
                        accessibilityLabel={`Delete ${role.title}`}
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

            {/* Extracurriculars */}
            {leadership.extracurriculars.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Extracurriculars</Text>
                {leadership.extracurriculars.map((ec) => (
                  <VCard key={ec.id} variant="outlined" style={styles.ecCard}>
                    <View style={styles.roleRow}>
                      <View>
                        <Text style={styles.ecName}>{ec.name}</Text>
                        <Text style={styles.ecPoints}>{ec.points} points</Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          Alert.alert('Delete', `Remove "${ec.name}"?`, [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deleteExtracurricular(ec.id) },
                          ]);
                        }}
                        accessibilityLabel={`Delete ${ec.name}`}
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

        {/* Action Buttons */}
        <View style={styles.actions}>
          <VButton
            title="Log New Role"
            onPress={() => setRoleModalVisible(true)}
            variant="filled"
            icon={<MaterialIcons name="add" size={18} color={colors.onPrimary} />}
            accessibilityLabel="Log a new leadership role"
          />
          <VButton
            title="Add Activity"
            onPress={() => setEcModalVisible(true)}
            variant="outlined"
            icon={<MaterialIcons name="add" size={18} color={colors.primary} />}
            accessibilityLabel="Add an extracurricular activity"
          />
        </View>
      </ScrollView>

      {/* Add Role Modal */}
      <Modal
        visible={roleModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Role</Text>
            <Pressable
              onPress={() => setRoleModalVisible(false)}
              accessibilityLabel="Close"
              style={styles.modalClose}
            >
              <MaterialIcons name="close" size={24} color={colors.onSurface} />
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            <VInput label="Role Title" value={roleTitle} onChangeText={setRoleTitle} placeholder="e.g. Platoon Leader" />
            <VInput label="Unit" value={roleUnit} onChangeText={setRoleUnit} placeholder="e.g. 1st Battalion" />
            <VInput label="Points" value={rolePoints} onChangeText={setRolePoints} placeholder="e.g. 15" keyboardType="decimal-pad" />
            <VButton title="Add Role" onPress={handleAddRole} variant="filled" style={{ marginTop: spacing.md }} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Add Extracurricular Modal */}
      <Modal
        visible={ecModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEcModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Activity</Text>
            <Pressable
              onPress={() => setEcModalVisible(false)}
              accessibilityLabel="Close"
              style={styles.modalClose}
            >
              <MaterialIcons name="close" size={24} color={colors.onSurface} />
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            <VInput label="Activity Name" value={ecName} onChangeText={setEcName} placeholder="e.g. Ranger Challenge" />
            <VInput label="Points" value={ecPoints} onChangeText={setEcPoints} placeholder="e.g. 5" keyboardType="decimal-pad" />
            <VButton title="Add Activity" onPress={handleAddEc} variant="filled" style={{ marginTop: spacing.md }} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* CST Score Modal */}
      <Modal
        visible={cstModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCstModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>CST Score</Text>
            <Pressable
              onPress={() => setCstModalVisible(false)}
              accessibilityLabel="Close"
              style={styles.modalClose}
            >
              <MaterialIcons name="close" size={24} color={colors.onSurface} />
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            <VInput
              label="CST Score (0-100)"
              value={cstInput}
              onChangeText={setCstInput}
              placeholder="e.g. 85"
              keyboardType="number-pad"
            />
            <VButton title="Save" onPress={handleSetCST} variant="filled" style={{ marginTop: spacing.md }} />
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
  metricCard: {
    marginBottom: spacing.md,
  },
  cstCard: {
    marginBottom: spacing.md,
  },
  cstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cstLabel: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
  },
  cstValue: {
    ...typography.titleMedium,
    color: colors.onSurface,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  roleCard: {
    marginBottom: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roleTitle: {
    ...typography.titleSmall,
    color: colors.onSurface,
  },
  roleUnit: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  roleDate: {
    ...typography.bodySmall,
    color: colors.outline,
    marginTop: 4,
  },
  ecCard: {
    marginBottom: spacing.sm,
  },
  ecName: {
    ...typography.titleSmall,
    color: colors.onSurface,
  },
  ecPoints: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
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
