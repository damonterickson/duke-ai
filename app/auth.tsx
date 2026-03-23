import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../src/theme/tokens';
import { signInWithMagicLink } from '../src/services/supabase';

type ScreenState = 'input' | 'sent';

export default function AuthScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ScreenState>('input');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSend = useCallback(async () => {
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Please enter a valid email address.'); return; }
    setError(null);
    setLoading(true);
    const { error: apiErr } = await signInWithMagicLink(email.trim());
    setLoading(false);
    if (apiErr) { setError(apiErr); return; }
    setState('sent');
    setCooldown(30);
  }, [email]);

  const olive = isDark ? '#7a8a2a' : '#343c0a';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.center}>
          <Text style={[styles.brand, { color: olive }]}>DUKE VANGUARD</Text>
          <MaterialIcons name="shield" size={72} color={olive} style={styles.icon} />
          <Text style={[styles.headline, { color: colors.on_surface }]}>
            Sign in to unlock Squads
          </Text>
          <Text style={[styles.subtext, { color: colors.outline }]}>
            Enter your school email to get a magic link {'\u2014'} no password needed.
          </Text>

          {state === 'input' ? (
            <>
              <TextInput
                style={[styles.input, { color: colors.on_surface, borderColor: colors.outline, backgroundColor: colors.surface_container }]}
                placeholder="you@dukes.jmu.edu"
                placeholderTextColor={colors.outline}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
              {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
              <Pressable
                style={[styles.btn, { backgroundColor: olive, opacity: loading ? 0.6 : 1 }]}
                onPress={handleSend}
                disabled={loading}
              >
                <Text style={styles.btnText}>{loading ? 'Sending...' : 'Send Magic Link'}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <MaterialIcons name="mark-email-read" size={40} color={colors.primary} style={styles.icon} />
              <Text style={[styles.headline, { color: colors.primary }]}>Check your email!</Text>
              {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
              <Pressable
                style={[styles.btn, { backgroundColor: olive, opacity: cooldown > 0 ? 0.4 : 1 }]}
                onPress={handleSend}
                disabled={cooldown > 0}
              >
                <Text style={styles.btnText}>
                  {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend'}
                </Text>
              </Pressable>
            </>
          )}

          <Pressable onPress={() => router.replace('/')} style={styles.skip}>
            <Text style={[styles.skipText, { color: colors.outline }]}>
              Skip {'\u2014'} use app without squads
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6] },
  brand: { ...typography.label_lg, letterSpacing: 3, textTransform: 'uppercase', marginBottom: spacing[4] },
  icon: { marginBottom: spacing[4] },
  headline: { ...typography.headline_sm, textAlign: 'center', marginBottom: spacing[2] },
  subtext: { ...typography.body_md, textAlign: 'center', marginBottom: spacing[5], paddingHorizontal: spacing[2] },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: roundness.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...typography.body_md,
    marginBottom: spacing[3],
  },
  error: { ...typography.label_sm, marginBottom: spacing[2], textAlign: 'center' },
  btn: {
    width: '100%',
    paddingVertical: spacing[3],
    borderRadius: roundness.md,
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  btnText: { ...typography.label_lg, color: '#ffffff' },
  skip: { paddingVertical: spacing[2] },
  skipText: { ...typography.body_sm, textDecorationLine: 'underline' },
});
