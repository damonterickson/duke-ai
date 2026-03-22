import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  AccessibilityInfo,
} from 'react-native';
import { colors, roundness, spacing } from '../theme/tokens';

export interface VSkeletonLoaderProps {
  /** Width of the skeleton block */
  width?: number | string;
  /** Height of the skeleton block */
  height?: number;
  /** Border radius token */
  radius?: keyof typeof roundness;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const VSkeletonLoader: React.FC<VSkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  radius = 'md',
  style,
  accessibilityLabel,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check reduce-motion preference
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled: boolean) => setReduceMotion(enabled),
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [reduceMotion, shimmer]);

  const backgroundColor = reduceMotion
    ? colors.surface_container_low
    : shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.surface_container_low, colors.surface_container_high],
      });

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius: roundness[radius],
          backgroundColor,
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel ?? 'Loading...'}
      accessibilityRole="progressbar"
    />
  );
};
