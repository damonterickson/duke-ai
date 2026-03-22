import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography } from '../../src/theme/tokens';

export default function TabsLayout() {
  const { colors, isDark } = useTheme();

  // Bottom nav uses the military olive/dark header color
  const tabBarBg = isDark ? 'rgba(21, 19, 23, 0.80)' : 'rgba(52, 60, 10, 0.90)';
  const activeColor = isDark ? '#f8e19e' : '#ffffff';
  const inactiveColor = isDark ? 'rgba(150, 141, 157, 0.70)' : 'rgba(255, 255, 255, 0.50)';
  const activeBg = isDark ? '#450084' : '#4B5320';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Fix web z-index: inactive tabs render with position:absolute and
        // intercept pointer events. unmountOnBlur removes them from the DOM entirely.
        ...(Platform.OS === 'web' ? { unmountOnBlur: true } : {}),
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopWidth: 0, // No-Line Rule
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 24,
          paddingTop: 8,
          height: 72,
        },
        tabBarLabelStyle: {
          fontFamily: typography.label_sm.fontFamily,
          fontSize: 10,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
        },
        tabBarItemStyle: {
          borderRadius: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mission',
          tabBarAccessibilityLabel: 'Mission tab — command dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="gps-fixed" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="intel"
        options={{
          title: 'Intel',
          tabBarAccessibilityLabel: 'Intel tab — AI briefing and analytics',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="analytics" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="squad"
        options={{
          title: 'Squad',
          tabBarAccessibilityLabel: 'Squad tab — leaderboard and competition',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="groups" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel: 'Profile tab — your command center',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
      {/* Hide legacy tabs from tab bar — keep files for now to avoid breaking imports */}
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="academics" options={{ href: null }} />
      <Tabs.Screen name="fitness" options={{ href: null }} />
      <Tabs.Screen name="leadership" options={{ href: null }} />
    </Tabs>
  );
}
