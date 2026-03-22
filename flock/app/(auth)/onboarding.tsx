import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

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
  const { theme, isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [persona, setPersona] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [homeCity, setHomeCity] = useState('');
  const [saving, setSaving] = useState(false);

  const shadow = { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.06, shadowRadius: 8, elevation: 3 };

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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Progress bar */}
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 24, paddingTop: 20 }}>
        {[1, 2, 3].map(n => (
          <View key={n} style={{
            height: 4, flex: 1, borderRadius: 2,
            backgroundColor: step >= n ? theme.accent : theme.border,
          }} />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 28, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">

        {step === 1 && (
          <>
            <Text style={{ fontSize: 52, textAlign: 'center', marginBottom: 16 }}>🐦</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
              Welcome to FLOCK!
            </Text>
            <Text style={{ fontSize: 15, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 36 }}>
              First, pick a username so your flock can find you
            </Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 8 }}>Username</Text>
              <View style={[{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: theme.surfaceSecondary, borderWidth: 1, borderColor: theme.border,
                borderRadius: 14, paddingHorizontal: 16,
              }, shadow]}>
                <Text style={{ color: theme.textSecondary, fontSize: 18, fontWeight: '600', marginRight: 4 }}>@</Text>
                <TextInput
                  style={{ flex: 1, paddingVertical: 16, fontSize: 16, color: theme.text }}
                  placeholder="yourname"
                  placeholderTextColor={theme.textTertiary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>
            </View>

            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 8 }}>Home city (optional)</Text>
              <TextInput
                style={[{
                  backgroundColor: theme.surfaceSecondary, borderWidth: 1, borderColor: theme.border,
                  borderRadius: 14, padding: 16, fontSize: 15, color: theme.text,
                }, shadow]}
                placeholder="e.g. Cary, NC"
                placeholderTextColor={theme.textTertiary}
                value={homeCity}
                onChangeText={setHomeCity}
              />
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
                opacity: !username.trim() ? 0.4 : 1,
                shadowColor: theme.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
              }}
              onPress={() => username.trim() && setStep(2)}
              activeOpacity={0.85}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Continue →</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={{ fontSize: 52, textAlign: 'center', marginBottom: 16 }}>🧭</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
              How do you travel?
            </Text>
            <Text style={{ fontSize: 15, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
              We'll personalise your recommendations
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
              {PERSONAS.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[{
                    width: '47%', backgroundColor: persona === p.id ? theme.accentMuted : theme.surface,
                    borderRadius: 18, padding: 20, alignItems: 'center',
                    borderWidth: 2, borderColor: persona === p.id ? theme.accent : theme.border,
                  }, shadow]}
                  onPress={() => setPersona(p.id)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 38, marginBottom: 10 }}>{p.emoji}</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: persona === p.id ? theme.accent : theme.text, marginBottom: 4 }}>{p.label}</Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center' }}>{p.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <TouchableOpacity style={{ paddingVertical: 16, paddingHorizontal: 20 }} onPress={() => setStep(1)}>
                <Text style={{ color: theme.textSecondary, fontSize: 15 }}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[{
                  flex: 1, backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
                  opacity: !persona ? 0.4 : 1,
                }]}
                onPress={() => persona && setStep(3)}
                activeOpacity={0.85}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={{ fontSize: 52, textAlign: 'center', marginBottom: 16 }}>💫</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
              What's your vibe?
            </Text>
            <Text style={{ fontSize: 15, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 }}>
              Pick up to 5 travel styles you love
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              {VIBES.map(v => (
                <TouchableOpacity
                  key={v}
                  style={{
                    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 100,
                    backgroundColor: selectedVibes.includes(v) ? theme.accent : theme.surfaceSecondary,
                    borderWidth: 1.5, borderColor: selectedVibes.includes(v) ? theme.accent : theme.border,
                  }}
                  onPress={() => toggleVibe(v)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: selectedVibes.includes(v) ? '#fff' : theme.textSecondary, fontSize: 14, fontWeight: '600' }}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: theme.textTertiary, fontSize: 12, textAlign: 'center', marginBottom: 28 }}>
              {selectedVibes.length}/5 selected
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <TouchableOpacity style={{ paddingVertical: 16, paddingHorizontal: 20 }} onPress={() => setStep(2)}>
                <Text style={{ color: theme.textSecondary, fontSize: 15 }}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[{
                  flex: 1, backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
                }, { shadowColor: theme.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 }]}
                onPress={handleFinish}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Start Flying 🐦</Text>
                }
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
