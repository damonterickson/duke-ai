import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../../src/theme/tokens';
import { VButton, VGlassPanel } from '../../src/components';
import { useProfileStore } from '../../src/stores/profile';
import { setOnboardingComplete } from '../../src/services/storage';

export default function MissionReadyScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const profile = useProfileStore();

  const headerBg = isDark ? colors.surface_container_high : '#343c0a';

  // Animate elements in
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  const handleLaunch = () => {
    setOnboardingComplete(true);
    router.replace('/');
  };

  // Summary of what was collected
  const summaryItems = [
    { icon: 'person' as const, label: 'Year Group', value: profile.yearGroup ?? '--' },
    { icon: 'school' as const, label: 'Target Branch', value: profile.targetBranch ?? 'Not set' },
    { icon: 'gps-fixed' as const, label: 'Goal OML', value: profile.goalOml != null ? String(profile.goalOml) : 'Not set' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: headerBg }]}>
      <View style={[styles.topBar, { backgroundColor: headerBg }]}>
        <Text style={styles.topBarText}>DUKE VANGUARD</Text>
      </View>

      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.successCircle, { backgroundColor: colors.primary_container }]}>
            <MaterialIcons name="check-circle" size={64} color={colors.primary} />
          </View>
        </Animated.View>

        {/* Mission Ready Text */}
        <Animated.View
          style={[
            styles.textSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.on_surface }]}>
            MISSION READY
          </Text>
          <Text style={[styles.subtitle, { color: colors.outline }]}>
            Your Vanguard profile is configured. The AI advisor is now calibrated
            to your goals and will provide personalized optimization guidance.
          </Text>
        </Animated.View>

        {/* Profile Summary */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <VGlassPanel style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: colors.outline }]}>MISSION PARAMETERS</Text>
            {summaryItems.map((item, i) => (
              <View key={i} style={styles.summaryRow}>
                <MaterialIcons name={item.icon} size={18} color={colors.primary} />
                <Text style={[styles.summaryItemLabel, { color: colors.outline }]}>{item.label}</Text>
                <Text style={[styles.summaryItemValue, { color: colors.on_surface }]}>{item.value}</Text>
              </View>
            ))}
          </VGlassPanel>
        </Animated.View>

        {/* What's Next */}
        <Animated.View style={[styles.nextSection, { opacity: fadeAnim }]}>
          {[
            { icon: 'analytics' as const, text: 'Get your first AI intelligence brief' },
            { icon: 'trending-up' as const, text: 'Track scores across all three OML pillars' },
            { icon: 'groups' as const, text: 'Join or create a squad to compete' },
          ].map((item, i) => (
            <View key={i} style={styles.nextRow}>
              <View style={[styles.nextDot, { backgroundColor: colors.primary }]}>
                <MaterialIcons name={item.icon} size={14} color={colors.on_primary} />
              </View>
              <Text style={[styles.nextText, { color: colors.on_surface }]}>{item.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA */}
        <View style={styles.footer}>
          <VButton
            label="Launch Mission"
            onPress={handleLaunch}
            style={styles.launchBtn}
            accessibilityLabel="Complete setup and go to app"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  topBarText: {
    ...typography.label_lg,
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },

  // Icon
  iconSection: {
    alignItems: 'center',
    marginTop: spacing[8],
    marginBottom: spacing[4],
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text
  textSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    ...typography.display_sm,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: spacing[2],
  },
  subtitle: {
    ...typography.body_md,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Summary
  summaryCard: { marginBottom: spacing[4] },
  summaryLabel: {
    ...typography.label_sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  summaryItemLabel: { ...typography.label_md, flex: 1 },
  summaryItemValue: { ...typography.body_md, fontWeight: '600' },

  // Next steps
  nextSection: { marginBottom: spacing[4] },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  nextDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: { ...typography.body_md, flex: 1 },

  // Footer
  footer: {
    marginTop: 'auto' as unknown as number,
    paddingBottom: spacing[8],
  },
  launchBtn: { width: '100%' },
});
