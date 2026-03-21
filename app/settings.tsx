import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { VButton, VCard, VInput } from '../src/components';
import { colors, typography, spacing } from '../src/theme/tokens';
import { useProfileStore } from '../src/stores/useProfileStore';
import { clearAllData } from '../src/services/storage';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfileStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (field: string, currentValue: string) => {
    setEditing(field);
    setEditValue(currentValue);
  };

  const saveEdit = async () => {
    if (!editing) return;

    const updates: Record<string, string | number> = {};
    if (editing === 'name') updates.name = editValue;
    else if (editing === 'battalion') updates.battalion = editValue;
    else if (editing === 'targetBranch') updates.targetBranch = editValue;
    else if (editing === 'goalOML') {
      const val = parseFloat(editValue);
      if (isNaN(val) || val < 0 || val > 100) {
        Alert.alert('Invalid', 'Goal OML must be between 0 and 100.');
        return;
      }
      updates.goalOML = val;
    }

    await updateProfile(updates);
    setEditing(null);
    setEditValue('');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your data including courses, assessments, roles, and conversations. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            router.replace('/onboarding/welcome');
          },
        },
      ]
    );
  };

  const fields = [
    { key: 'name', label: 'Name', value: profile.name || 'Not set' },
    { key: 'yearGroup', label: 'Year Group', value: profile.yearGroup, readonly: true },
    { key: 'battalion', label: 'Battalion', value: profile.battalion || 'Not set' },
    { key: 'targetBranch', label: 'Target Branch', value: profile.targetBranch || 'Not set' },
    { key: 'goalOML', label: 'Goal OML', value: profile.goalOML ? `${profile.goalOML}` : 'Not set' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Profile Section */}
        <Text style={styles.sectionTitle}>Profile</Text>
        <VCard variant="filled" style={styles.profileCard}>
          {fields.map((field) => (
            <View key={field.key} style={styles.fieldRow}>
              <View style={styles.fieldInfo}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {editing === field.key ? (
                  <View style={styles.editRow}>
                    <VInput
                      label=""
                      value={editValue}
                      onChangeText={setEditValue}
                      keyboardType={field.key === 'goalOML' ? 'decimal-pad' : 'default'}
                      style={styles.editInput}
                      accessibilityLabel={`Edit ${field.label}`}
                    />
                    <Pressable
                      onPress={saveEdit}
                      accessibilityLabel="Save"
                      accessibilityRole="button"
                      style={styles.saveButton}
                    >
                      <MaterialIcons name="check" size={20} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      onPress={() => setEditing(null)}
                      accessibilityLabel="Cancel edit"
                      accessibilityRole="button"
                      style={styles.cancelEditButton}
                    >
                      <MaterialIcons name="close" size={20} color={colors.outline} />
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.fieldValue}>{field.value}</Text>
                )}
              </View>
              {!field.readonly && editing !== field.key && (
                <Pressable
                  onPress={() => startEdit(field.key, field.value === 'Not set' ? '' : field.value)}
                  accessibilityLabel={`Edit ${field.label}`}
                  accessibilityRole="button"
                  style={styles.editButton}
                >
                  <MaterialIcons name="edit" size={18} color={colors.outline} />
                </Pressable>
              )}
            </View>
          ))}
        </VCard>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Data</Text>
        <VButton
          title="Clear All Data"
          onPress={handleClearData}
          variant="outlined"
          style={styles.clearButton}
          accessibilityLabel="Clear all data permanently"
        />

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Iron Vanguard v{APP_VERSION}</Text>
          <Text style={styles.appInfoText}>Army ROTC OML Optimizer</Text>
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
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.titleLarge,
    color: colors.onSurface,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  profileCard: {
    gap: 0,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    minHeight: 44,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
  },
  fieldValue: {
    ...typography.bodyLarge,
    color: colors.onSurface,
    marginTop: 2,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  editInput: {
    flex: 1,
    marginBottom: 0,
  },
  editButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    borderColor: colors.error,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    gap: spacing.xs,
  },
  appInfoText: {
    ...typography.bodySmall,
    color: colors.outline,
  },
});
