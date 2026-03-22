import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Polyline, Rect } from 'react-native-svg';
import { colors, roundness, spacing } from '../theme/tokens';

export interface VChartLineProps {
  /** Array of y-values; x is evenly distributed */
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const VChartLine: React.FC<VChartLineProps> = ({
  data,
  width = 300,
  height = 150,
  strokeColor = colors.primary,
  strokeWidth = 2,
  style,
  accessibilityLabel,
}) => {
  if (data.length === 0) return null;

  const padding = 8;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const points = data
    .map((val, i) => {
      const x = padding + (i / Math.max(data.length - 1, 1)) * chartW;
      const y = padding + chartH - ((val - minVal) / range) * chartH;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={accessibilityLabel ?? 'Line chart'}
      accessibilityRole="image"
    >
      <Svg width={width} height={height}>
        {/* Background — using surface tier, no border */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={roundness.lg}
          fill={colors.surface_container_low}
        />
        <Polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: roundness.lg,
    overflow: 'hidden',
    // No border — Rule 1
  },
});
