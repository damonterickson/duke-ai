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
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../../src/theme/tokens';
import { joinSquad } from '../../src/services/supabase';

export default function JoinSquadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinedSquad, setJoinedSquad] = useState<{ id: string; name: string } | null>(null);

  const handleJoin = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);
    const { squad, error: err } = await joinSquad(code);
    setLoading(false);
    if (err) {
      setError(err);
    } else if (squad) {
      setJoinedSquad({ id: squad.id, name: squad.name });
    }
  };

  const handleContinue = () => {
    if (joinedSquad) {
      router.replace(`/squad/${joinedSquad.id}`);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { borderBottomColor: colors.surface_container }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={colors.on_surface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.on_surface }]}>Join Squad</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        {!joinedSquad ? (
          <>
            <Text style={[styles.label, { color: colors.on_surface }]}>Invite Code</Text>
            <TextInput
              style={[styles.input, { color: colors.on_surface, backgroundColor: colors.surface_container, borderColor: colors.outline }]}
              placeholder="ABCDEF"
              placeholderTextColor={colors.outline}
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase().slice(0, 6))}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
            {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary, opacity: loading || code.length !== 6 ? 0.5 : 1 }]}
              onPress={handleJoin}
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <ActivityIndicator color={colors.on_primary} />
              ) : (
                <Text style={[styles.btnText, { color: colors.on_primary }]}>Join</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.successContainer}>
            <MaterialIcons name="check-circle" size={48} color={colors.primary} />
            <Text style={[styles.successTitle, { color: colors.on_surface }]}>You're in!</Text>
            <Text style={[styles.squadName, { color: colors.outline }]}>{joinedSquad.name}</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleContinue}>
              <Text style={[styles.btnText, { color: colors.on_primary }]}>View Squad</Text>
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
    ...typography.display_sm, paddingHorizontal: spacing[3], paddingVertical: spacing[3],
    borderRadius: roundness.md, borderWidth: 1, marginBottom: spacing[4],
    textAlign: 'center', letterSpacing: 6,
  },
  error: { ...typography.label_sm, marginBottom: spacing[3] },
  btn: { paddingVertical: spacing[3], borderRadius: roundness.md, alignItems: 'center' },
  btnText: { ...typography.label_lg },
  successContainer: { alignItems: 'center', marginTop: spacing[8] },
  successTitle: { ...typography.title_lg, marginTop: spacing[3] },
  squadName: { ...typography.body_lg, marginTop: spacing[1], marginBottom: spacing[6] },
});
