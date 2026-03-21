import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, roundness } from '../theme/tokens';

export interface TabItem {
  key: string;
  label: string;
  /** Material icon name — rendered as text for now; swap for @expo/vector-icons later */
  icon: string;
}

export interface VTabBarProps {
  tabs: TabItem[];
  activeKey: string;
  onTabPress: (key: string) => void;
  accessibilityLabel?: string;
}

export const VTabBar: React.FC<VTabBarProps> = ({
  tabs,
  activeKey,
  onTabPress,
  accessibilityLabel,
}) => {
  return (
    <View
      style={styles.bar}
      accessibilityLabel={accessibilityLabel ?? 'Tab bar'}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            style={styles.tab}
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.icon, active ? styles.activeIcon : styles.inactiveIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, active ? styles.activeLabel : styles.inactiveLabel]}>
              {tab.label}
            </Text>
            {active && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface_container_low,
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
    // No border — Rule 1
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[1],
    gap: 2,
  },
  icon: {
    fontSize: 24,
  },
  activeIcon: {
    color: colors.primary,
  },
  inactiveIcon: {
    color: colors.outline,
  },
  label: {
    ...typography.label_sm,
  },
  activeLabel: {
    color: colors.primary,
  },
  inactiveLabel: {
    color: colors.outline,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    borderRadius: roundness.sm,
    backgroundColor: colors.primary,
  },
});
