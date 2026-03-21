import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/tokens';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="year-group" />
      <Stack.Screen name="gpa" />
      <Stack.Screen name="aft" />
      <Stack.Screen name="leadership" />
      <Stack.Screen name="branch" />
    </Stack>
  );
}
