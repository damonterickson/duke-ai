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
import { VGlassPanel } from '../src/components';
import { useProfileStore } from '../src/stores/profile';
import { useScoresStore } from '../src/stores/scores';

type UploadType = 'accession' | 'transcript' | 'acft' | 'oml';

interface UploadItem {
  type: UploadType;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  accepted: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
}

export default function UploadSyncScreen() {
  const router = useRouter();
  const { colors, isDark, glass, ghostBorder } = useTheme();
  const profile = useProfileStore();
  const scores = useScoresStore();

  const headerBg = isDark ? colors.surface_container_high : '#343c0a';

  const [items, setItems] = useState<UploadItem[]>([
    {
      type: 'accession',
      icon: 'description',
      title: 'Accession Sheet',
      description: 'Upload your DA Form 597 or accession packet to auto-populate profile data.',
      accepted: 'PDF, JPG, PNG',
      status: 'idle',
    },
    {
      type: 'transcript',
      icon: 'school',
      title: 'Academic Transcript',
      description: 'Import your unofficial or official transcript to sync GPA and credit hours.',
      accepted: 'PDF',
      status: 'idle',
    },
    {
      type: 'acft',
      icon: 'fitness-center',
      title: 'ACFT Scorecard',
      description: 'Upload your ACFT scorecard to automatically log event scores.',
      accepted: 'PDF, JPG, PNG',
      status: 'idle',
    },
    {
      type: 'oml',
      icon: 'assessment',
      title: 'OML Worksheet',
      description: 'Import a cadre-provided OML worksheet to validate your calculated score.',
      accepted: 'PDF, XLSX',
      status: 'idle',
    },
  ]);

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const lastSync = profile.name ? 'Today, 14:32' : 'Never';

  const handleUpload = useCallback((type: UploadType) => {
    // In a real implementation, this would use expo-document-picker
    // For now, show feedback that the feature is available
    Alert.alert(
      'Upload Document',
      'Document upload requires camera or file access. This feature will use your device\'s document picker to scan and import data automatically.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select File',
          onPress: () => {
            // Simulate upload process
            setItems(prev =>
              prev.map(item =>
                item.type === type ? { ...item, status: 'uploading' as const } : item,
              ),
            );
            setTimeout(() => {
              setItems(prev =>
                prev.map(item =>
                  item.type === type ? { ...item, status: 'success' as const } : item,
                ),
              );
            }, 2000);
          },
        },
      ],
    );
  }, []);

  const handleSync = useCallback(() => {
    setSyncStatus('syncing');
    // Simulate sync with server
    setTimeout(() => {
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 2000);
  }, []);

  const getStatusIcon = (status: UploadItem['status']): { name: keyof typeof MaterialIcons.glyphMap; color: string } => {
    switch (status) {
      case 'uploading':
        return { name: 'hourglass-top', color: colors.tertiary };
      case 'success':
        return { name: 'check-circle', color: '#4caf50' };
      case 'error':
        return { name: 'error', color: colors.error };
      default:
        return { name: 'cloud-upload', color: colors.primary };
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: headerBg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerText}>UPLOAD & SYNC</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.surface }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Sync Status Card */}
        <VGlassPanel style={styles.syncCard}>
          <View style={styles.syncRow}>
            <View style={styles.syncInfo}>
              <Text style={[styles.syncLabel, { color: colors.outline }]}>DATA SYNC STATUS</Text>
              <Text style={[styles.syncTime, { color: colors.on_surface }]}>
                Last sync: {lastSync}
              </Text>
            </View>
            <Pressable
              style={[
                styles.syncBtn,
                { backgroundColor: syncStatus === 'synced' ? '#4caf50' : colors.primary },
              ]}
              onPress={handleSync}
              disabled={syncStatus === 'syncing'}
              accessibilityLabel="Sync data"
            >
              {syncStatus === 'syncing' ? (
                <ActivityIndicator size="small" color={colors.on_primary} />
              ) : (
                <>
                  <MaterialIcons
                    name={syncStatus === 'synced' ? 'check' : 'sync'}
                    size={18}
                    color={colors.on_primary}
                  />
                  <Text style={[styles.syncBtnText, { color: colors.on_primary }]}>
                    {syncStatus === 'synced' ? 'Synced' : 'Sync Now'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
          <View style={styles.syncStats}>
            <View style={styles.syncStat}>
              <Text style={[styles.syncStatValue, { color: colors.on_surface }]}>
                {scores.scoreHistory.length}
              </Text>
              <Text style={[styles.syncStatLabel, { color: colors.outline }]}>Score Entries</Text>
            </View>
            <View style={[styles.syncDivider, { backgroundColor: colors.outline_variant }]} />
            <View style={styles.syncStat}>
              <Text style={[styles.syncStatValue, { color: colors.on_surface }]}>
                {profile.name ? '1' : '0'}
              </Text>
              <Text style={[styles.syncStatLabel, { color: colors.outline }]}>Profile</Text>
            </View>
            <View style={[styles.syncDivider, { backgroundColor: colors.outline_variant }]} />
            <View style={styles.syncStat}>
              <Text style={[styles.syncStatValue, { color: colors.on_surface }]}>0</Text>
              <Text style={[styles.syncStatLabel, { color: colors.outline }]}>Documents</Text>
            </View>
          </View>
        </VGlassPanel>

        {/* Upload Section */}
        <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>Upload Documents</Text>
        <Text style={[styles.sectionDesc, { color: colors.outline }]}>
          Upload your military documents to auto-populate scores and profile data.
          AI will extract relevant information automatically.
        </Text>

        {items.map((item) => {
          const statusInfo = getStatusIcon(item.status);
          return (
            <Pressable
              key={item.type}
              style={[
                styles.uploadCard,
                {
                  backgroundColor: glass.overlayColor,
                  borderColor: item.status === 'success' ? '#4caf50' : ghostBorder.color,
                  borderWidth: ghostBorder.width,
                },
              ]}
              onPress={() => handleUpload(item.type)}
              disabled={item.status === 'uploading'}
              accessibilityLabel={`Upload ${item.title}`}
            >
              <View style={[styles.uploadIcon, { backgroundColor: colors.primary_container }]}>
                <MaterialIcons name={item.icon as any} size={24} color={colors.on_primary_container} />
              </View>
              <View style={styles.uploadContent}>
                <View style={styles.uploadTitleRow}>
                  <Text style={[styles.uploadTitle, { color: colors.on_surface }]}>{item.title}</Text>
                  {item.status === 'uploading' ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <MaterialIcons name={statusInfo.name as any} size={20} color={statusInfo.color} />
                  )}
                </View>
                <Text style={[styles.uploadDesc, { color: colors.outline }]}>{item.description}</Text>
                <Text style={[styles.uploadAccepted, { color: colors.outline_variant }]}>
                  Accepts: {item.accepted}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {/* Manual Entry Option */}
        <VGlassPanel style={styles.manualCard}>
          <MaterialIcons name="edit-note" size={28} color={colors.primary} />
          <View style={styles.manualContent}>
            <Text style={[styles.manualTitle, { color: colors.on_surface }]}>
              Prefer manual entry?
            </Text>
            <Text style={[styles.manualDesc, { color: colors.outline }]}>
              You can always enter scores directly on the Profile or individual tracker screens.
            </Text>
          </View>
        </VGlassPanel>
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

  // Sync card
  syncCard: { marginBottom: spacing[6] },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  syncInfo: { flex: 1 },
  syncLabel: {
    ...typography.label_sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing[1],
  },
  syncTime: { ...typography.body_md },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: roundness.md,
  },
  syncBtnText: { ...typography.label_lg },
  syncStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncStat: { flex: 1, alignItems: 'center' },
  syncStatValue: { ...typography.title_md },
  syncStatLabel: { ...typography.label_sm, marginTop: 2 },
  syncDivider: { width: 1, height: 32 },

  // Section
  sectionTitle: { ...typography.title_md, marginBottom: spacing[1] },
  sectionDesc: { ...typography.body_sm, marginBottom: spacing[4] },

  // Upload cards
  uploadCard: {
    flexDirection: 'row',
    padding: spacing[4],
    borderRadius: roundness.xl,
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: roundness.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadContent: { flex: 1 },
  uploadTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  uploadTitle: { ...typography.title_sm },
  uploadDesc: { ...typography.body_sm, marginBottom: spacing[1] },
  uploadAccepted: { ...typography.label_sm },

  // Manual entry
  manualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  manualContent: { flex: 1 },
  manualTitle: { ...typography.title_sm, marginBottom: spacing[1] },
  manualDesc: { ...typography.body_sm },
});
