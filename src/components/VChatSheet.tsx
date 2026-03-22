import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  colors,
  typography,
  spacing,
  roundness,
  ghostBorder,
} from '../theme/tokens';
import { VAIResponse } from './VAIResponse';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export interface VChatSheetProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  visible?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;

export const VChatSheet: React.FC<VChatSheetProps> = ({
  messages,
  onSend,
  visible = true,
  style,
  accessibilityLabel,
}) => {
  const [draft, setDraft] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  if (!visible) return null;

  const handleSend = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) return;
    onSend(trimmed);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.sheet, style]}
      accessibilityLabel={accessibilityLabel ?? 'Chat panel'}
      accessibilityRole="none"
    >
      {/* Glassmorphism background — heavier blur */}
      <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      {/* Drag handle */}
      <View style={styles.handleWrapper}>
        <View style={styles.handle} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
            accessibilityLabel={`${item.sender === 'user' ? 'You' : 'AI'}: ${item.text}`}
          >
            {item.sender === 'ai' ? (
              <VAIResponse text={item.text} />
            ) : (
              <Text style={[styles.bubbleText, styles.userText]}>
                {item.text}
              </Text>
            )}
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask your AI coach..."
          placeholderTextColor={colors.outline}
          style={styles.input}
          accessibilityLabel="Chat message input"
          accessibilityRole="text"
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable
          onPress={handleSend}
          style={styles.sendButton}
          accessibilityLabel="Send message"
          accessibilityRole="button"
        >
          <Text style={styles.sendIcon}>{'\u2191'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: roundness.xl,
    borderTopRightRadius: roundness.xl,
    overflow: 'hidden',
    // No border — Rule 1
  },
  overlay: {
    backgroundColor: 'rgba(55, 52, 56, 0.55)', // surface_variant at ~55% opacity
  },
  handleWrapper: {
    alignItems: 'center',
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: roundness.sm,
    backgroundColor: colors.outline,
    opacity: 0.4,
  },
  list: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
    gap: spacing[3],
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: roundness.lg,
    // No border — Rule 1
  },
  userBubble: {
    backgroundColor: colors.primary_container,
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: colors.surface_container_low,
    alignSelf: 'flex-start',
  },
  bubbleText: {
    ...typography.body_md,
  },
  userText: {
    color: colors.on_primary,
  },
  aiText: {
    color: colors.on_surface,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface_container_low,
    borderRadius: roundness.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    ...typography.body_md,
    color: colors.on_surface,
    borderWidth: ghostBorder.width,
    borderColor: ghostBorder.color,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: roundness.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: colors.on_primary,
    fontSize: 20,
    fontWeight: '700',
  },
});
