import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../../src/theme/tokens';
import { createSquad } from '../../src/services/supabase';

export default function CreateSquadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    const { squad, error: err } = await createSquad(name.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else if (squad) {
      setInviteCode(squad.invite_code);
    }
  };

  const handleCopy = async () => {
    if (inviteCode) {
      await Clipboard.setStringAsync(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { borderBottomColor: colors.surface_container }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={colors.on_surface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.on_surface }]}>Create Squad</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        {!inviteCode ? (
          <>
            <Text style={[styles.label, { color: colors.on_surface }]}>Squad Name</Text>
            <TextInput
              style={[styles.input, { color: colors.on_surface, backgroundColor: colors.surface_container, borderColor: colors.outline }]}
              placeholder="e.g., Bravo Company"
              placeholderTextColor={colors.outline}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary, opacity: loading || !name.trim() ? 0.5 : 1 }]}
              onPress={handleCreate}
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <ActivityIndicator color={colors.on_primary} />
              ) : (
                <Text style={[styles.btnText, { color: colors.on_primary }]}>Create Squad</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.successContainer}>
            <MaterialIcons name="check-circle" size={48} color={colors.primary} />
            <Text style={[styles.successLabel, { color: colors.outline }]}>Your invite code:</Text>
            <Text style={[styles.codeText, { color: colors.on_surface }]}>{inviteCode}</Text>
            <Text style={[styles.subtitle, { color: colors.outline }]}>
              Share this code with your squad mates
            </Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleCopy}>
              <Text style={[styles.btnText, { color: colors.on_primary }]}>
                {copied ? 'Copied!' : 'Copy Code'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.surface_container, marginTop: spacing[2] }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.btnText, { color: colors.on_surface }]}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1,
  },
  headerTitle: { ...typography.title_md },
  body: { padding: spacing[4], flex: 1 },
  label: { ...typography.label_lg, marginBottom: spacing[2] },
  input: {
    ...typography.body_md, paddingHorizontal: spacing[3], paddingVertical: spacing[3],
    borderRadius: roundness.md, borderWidth: 1, marginBottom: spacing[4],
  },
  error: { ...typography.label_sm, marginBottom: spacing[3] },
  btn: {
    paddingVertical: spacing[3], borderRadius: roundness.md, alignItems: 'center',
  },
  btnText: { ...typography.label_lg },
  successContainer: { alignItems: 'center', marginTop: spacing[8] },
  successLabel: { ...typography.label_lg, marginTop: spacing[4] },
  codeText: { ...typography.display_lg, letterSpacing: 8, marginVertical: spacing[2] },
  subtitle: { ...typography.body_md, textAlign: 'center', marginBottom: spacing[6] },
});
