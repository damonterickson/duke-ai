import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/tokens';

export interface VConicGaugeProps {
  /** Value from 0 to 1 */
  progress: number;
  /** Size (width & height) of the gauge */
  size?: number;
  /** Stroke width of the arc */
  strokeWidth?: number;
  /** Center label (e.g. score) */
  label?: string;
  /** Optional sublabel below the main label */
  sublabel?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

/**
 * Builds an SVG arc path for a partial circle.
 */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const start = {
    x: cx + r * Math.cos(rad(endAngle)),
    y: cy + r * Math.sin(rad(endAngle)),
  };
  const end = {
    x: cx + r * Math.cos(rad(startAngle)),
    y: cy + r * Math.sin(rad(startAngle)),
  };
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export const VConicGauge: React.FC<VConicGaugeProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  style,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, progress));
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;

  // Full circle background arc (270 degrees, from 135 to 405 i.e. 3/4 circle)
  const totalAngle = 270;
  const startAngle = 135;
  const endAngle = startAngle + totalAngle;
  const fillAngle = startAngle + totalAngle * clamped;

  const bgPath = describeArc(cx, cy, r, startAngle, endAngle);
  const fillPath =
    clamped > 0 ? describeArc(cx, cy, r, startAngle, fillAngle) : '';

  return (
    <View
      style={[styles.container, { width: size, height: size }, style]}
      accessibilityLabel={
        accessibilityLabel ?? `Gauge: ${Math.round(clamped * 100)}%`
      }
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(clamped * 100),
      }}
    >
      <Svg width={size} height={size}>
        {/* Track */}
        <Path
          d={bgPath}
          stroke={colors.outline_variant}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          opacity={0.3}
        />
        {/* Fill */}
        {fillPath !== '' && (
          <Path
            d={fillPath}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>
      <View style={styles.labelContainer}>
        {label != null && (
          <Text style={[styles.label, { color: colors.on_surface }]}>{label}</Text>
        )}
        {sublabel != null && (
          <Text style={[styles.sublabel, { color: colors.outline }]}>{sublabel}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.headline_md,
  },
  sublabel: {
    ...typography.label_sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
});
