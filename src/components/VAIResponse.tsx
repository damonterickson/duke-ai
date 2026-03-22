/**
 * VAIResponse — Smart AI response renderer
 *
 * Renders markdown, detects actionable keywords, and creates
 * tappable links to relevant app sections (GPA, ACFT, Leadership).
 * Also renders inline action cards for trackable goals.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, roundness } from '../theme/tokens';

export interface VAIResponseProps {
  text: string;
  style?: ViewStyle;
}

// Keywords that map to app sections
const APP_LINKS: { pattern: RegExp; label: string; route: string; icon: string }[] = [
  { pattern: /\bGPA\b/i, label: 'GPA Tracker', route: '/(tabs)/academics', icon: '📚' },
  { pattern: /\bACFT\b|\bfitness\b|\b2[- ]mile run\b|\bdeadlift\b|\bpush[- ]?ups?\b|\bplank\b|\bsprint[- ]drag/i, label: 'ACFT Log', route: '/(tabs)/fitness', icon: '💪' },
  { pattern: /\bleadership\b|\bcommand\b|\bCST\b|\bCLC\b|\bextracurricular/i, label: 'Leadership Log', route: '/(tabs)/leadership', icon: '🎖️' },
  { pattern: /\bOML\b|\bdashboard\b|\bpillar/i, label: 'Dashboard', route: '/(tabs)/dashboard', icon: '📊' },
  { pattern: /\bwhat[- ]if\b|\bsimulat/i, label: 'What-If Simulator', route: '/what-if', icon: '🔮' },
];

// Detect action items in the response (bullet points with actionable language)
function extractActions(text: string): string[] {
  const actions: string[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Match bullet points or numbered items with actionable verbs
    if (/^[-*•]\s+.{10,}/.test(trimmed) || /^\d+[.)]\s+.{10,}/.test(trimmed)) {
      const content = trimmed.replace(/^[-*•\d.)\s]+/, '').trim();
      if (/^(focus|improve|raise|train|log|add|practice|target|aim|work|complete|submit|attend|run|increase|decrease|drop|shave)/i.test(content)) {
        actions.push(content);
      }
    }
  }
  return actions.slice(0, 3); // Max 3 actions
}

// Find which app sections the response references
function findLinks(text: string): typeof APP_LINKS {
  const found: typeof APP_LINKS = [];
  const seen = new Set<string>();
  for (const link of APP_LINKS) {
    if (link.pattern.test(text) && !seen.has(link.route)) {
      found.push(link);
      seen.add(link.route);
    }
  }
  return found.slice(0, 3); // Max 3 links
}

export const VAIResponse: React.FC<VAIResponseProps> = ({ text, style }) => {
  const router = useRouter();
  const links = findLinks(text);
  const actions = extractActions(text);

  return (
    <View style={[styles.container, style]}>
      {/* Rendered markdown */}
      <Markdown style={markdownStyles}>{text}</Markdown>

      {/* Action items (if found) */}
      {actions.length > 0 && (
        <View style={styles.actionsSection}>
          <Text style={styles.actionsHeader}>Action Items</Text>
          {actions.map((action, i) => (
            <View key={i} style={styles.actionItem}>
              <Text style={styles.actionCheckbox}>☐</Text>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick links to app sections */}
      {links.length > 0 && (
        <View style={styles.linksRow}>
          {links.map((link, i) => (
            <Pressable
              key={i}
              onPress={() => router.push(link.route as any)}
              style={styles.linkChip}
              accessibilityLabel={`Go to ${link.label}`}
              accessibilityRole="link"
            >
              <Text style={styles.linkIcon}>{link.icon}</Text>
              <Text style={styles.linkText}>{link.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const markdownStyles = StyleSheet.create({
  body: {
    color: colors.on_surface,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
  },
  heading1: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.on_surface,
    marginBottom: 4,
    marginTop: 8,
  },
  heading2: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.on_surface,
    marginBottom: 4,
    marginTop: 8,
  },
  heading3: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.on_surface,
    marginBottom: 2,
    marginTop: 6,
  },
  strong: {
    fontWeight: '600' as const,
    color: colors.primary,
  },
  em: {
    fontStyle: 'italic' as const,
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  list_item: {
    flexDirection: 'row' as const,
    marginVertical: 2,
  },
  paragraph: {
    marginVertical: 4,
  },
  code_inline: {
    backgroundColor: colors.surface_container_high,
    borderRadius: roundness.sm,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 13,
    fontFamily: 'monospace',
    color: colors.primary,
  },
  blockquote: {
    backgroundColor: colors.surface_container_low,
    borderLeftWidth: 3,
    borderLeftColor: colors.tertiary,
    paddingLeft: spacing[3],
    paddingVertical: spacing[2],
    marginVertical: spacing[2],
  },
});

const styles = StyleSheet.create({
  container: {
    // No extra padding — the bubble handles that
  },
  actionsSection: {
    marginTop: spacing[3],
    backgroundColor: colors.surface_container_lowest,
    borderRadius: roundness.md,
    padding: spacing[3],
  },
  actionsHeader: {
    ...typography.label_md,
    color: colors.tertiary,
    fontWeight: '600',
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginVertical: 2,
  },
  actionCheckbox: {
    fontSize: 14,
    color: colors.outline,
    marginTop: 1,
  },
  actionText: {
    ...typography.body_sm,
    color: colors.on_surface,
    flex: 1,
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  linkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface_container_lowest,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: roundness.md,
  },
  linkIcon: {
    fontSize: 14,
  },
  linkText: {
    ...typography.label_sm,
    color: colors.primary,
    fontWeight: '500',
  },
});
