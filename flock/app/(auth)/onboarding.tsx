import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

const PERSONAS = [
  { id: 'couple', emoji: '💑', label: 'Couple', desc: 'Romantic getaways' },
  { id: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family', desc: 'Kid-friendly adventures' },
  { id: 'solo', emoji: '🧳', label: 'Solo', desc: 'My way, my pace' },
  { id: 'friends', emoji: '🎉', label: 'Friends', desc: 'Group adventures' },
];

const VIBES = ['Beach', 'Mountains', 'City', 'Culture', 'Food', 'Adventure', 'Wellness', 'Luxury', 'Budget', 'Nature'];

export default function Onboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [persona, setPersona] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [homeCity, setHomeCity] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleVibe = (v: string) => {
    setSelectedVibes(prev => prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 5 ? [...prev, v] : prev);
  };

  const handleFinish = async () => {
    if (!user) return;
    if (!username.trim()) { Alert.alert('Choose a username'); return; }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.trim().toLowerCase().replace(/\s+/g, '_'),
        persona,
        vibe_profile: { vibes: selectedVibes },
        home_city: homeCity.trim() || null,
      })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      if (error.message.includes('unique')) {
        Alert.alert('Username taken', 'That username is already in use. Try another one.');
      } else {
        Alert.alert('Error', error.message);
      }
      return;
    }
    router.replace('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress */}
      <View style={styles.progressRow}>
        {[1, 2, 3].map(n => (
          <View key={n} style={[styles.progressDot, step >= n && styles.progressDotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <>
            <Text style={styles.emoji}>🐦</Text>
            <Text style={styles.title}>Welcome to FLOCK!</Text>
            <Text style={styles.subtitle}>First, pick a username so your flock can find you</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.usernameRow}>
                <Text style={styles.usernameAt}>@</Text>
                <TextInput
                  style={styles.usernameInput}
                  placeholder="yourname"
                  placeholderTextColor="rgba(237,232,223,0.25)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Home city (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. New York"
                placeholderTextColor="rgba(237,232,223,0.25)"
                value={homeCity}
                onChangeText={setHomeCity}
              />
            </View>
            <TouchableOpacity
              style={[styles.nextBtn, !username.trim() && styles.nextBtnDisabled]}
              onPress={() => username.trim() && setStep(2)}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>Continue →</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.emoji}>🧭</Text>
            <Text style={styles.title}>How do you travel?</Text>
            <Text style={styles.subtitle}>We'll personalise your recommendations</Text>
            <View style={styles.personaGrid}>
              {PERSONAS.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.personaCard, persona === p.id && styles.personaCardActive]}
                  onPress={() => setPersona(p.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.personaEmoji}>{p.emoji}</Text>
                  <Text style={[styles.personaLabel, persona === p.id && styles.personaLabelActive]}>{p.label}</Text>
                  <Text style={styles.personaDesc}>{p.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.navRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextBtn, styles.nextBtnFlex, !persona && styles.nextBtnDisabled]}
                onPress={() => persona && setStep(3)}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.emoji}>💫</Text>
            <Text style={styles.title}>What's your vibe?</Text>
            <Text style={styles.subtitle}>Pick up to 5 travel styles you love</Text>
            <View style={styles.vibeGrid}>
              {VIBES.map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.vibeChip, selectedVibes.includes(v) && styles.vibeChipActive]}
                  onPress={() => toggleVibe(v)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.vibeText, selectedVibes.includes(v) && styles.vibeTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.vibeCount}>{selectedVibes.length}/5 selected</Text>
            <View style={styles.navRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.nextBtn, styles.nextBtnFlex]} onPress={handleFinish} disabled={saving} activeOpacity={0.85}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextBtnText}>Start Flying 🐦</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.08)' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  progressRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, paddingTop: 16, justifyContent: 'center' },
  progressDot: { height: 4, flex: 1, borderRadius: 2, backgroundColor: C.surface },
  progressDotActive: { backgroundColor: C.coral },
  content: { padding: 24, paddingTop: 32, paddingBottom: 48 },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: C.muted, textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16 },
  usernameAt: { color: C.muted, fontSize: 18, fontWeight: '600', marginRight: 4 },
  usernameInput: { flex: 1, paddingVertical: 16, fontSize: 16, color: C.text },
  input: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 16, fontSize: 15, color: C.text },
  personaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  personaCard: { width: '47%', backgroundColor: C.surface, borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  personaCardActive: { borderColor: C.coral, backgroundColor: 'rgba(255,85,51,0.08)' },
  personaEmoji: { fontSize: 36, marginBottom: 8 },
  personaLabel: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  personaLabelActive: { color: C.coral },
  personaDesc: { fontSize: 12, color: C.muted, textAlign: 'center' },
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  vibeChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 100, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border },
  vibeChipActive: { backgroundColor: C.coral, borderColor: C.coral },
  vibeText: { color: C.muted, fontSize: 14, fontWeight: '600' },
  vibeTextActive: { color: '#fff' },
  vibeCount: { color: C.muted, fontSize: 12, textAlign: 'center', marginBottom: 28 },
  navRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  backBtn: { paddingVertical: 16, paddingHorizontal: 20 },
  backBtnText: { color: C.muted, fontSize: 15 },
  nextBtn: { backgroundColor: C.coral, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  nextBtnFlex: { flex: 1, marginTop: 0 },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
