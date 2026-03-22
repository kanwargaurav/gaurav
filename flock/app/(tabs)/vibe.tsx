import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Vibes } from '../../constants/vibes';
import { Personas } from '../../constants/personas';

type Destination = {
  id: string;
  place: string;
  country: string;
  emoji: string;
  description: string;
  days_rec: number;
  budget_usd: number;
  rating: number;
  tags: string[];
};

const BUDGETS = [
  { id: 'budget', label: '💰 Budget', desc: 'Under $1,000', max: 1000 },
  { id: 'mid', label: '✈️ Mid-range', desc: '$1k – $3k', max: 3000 },
  { id: 'premium', label: '⭐ Premium', desc: '$3k – $7k', max: 7000 },
  { id: 'luxury', label: '💎 Luxury', desc: '$7k+', max: 999999 },
];

export default function VibeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [step, setStep] = useState(0);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [budget, setBudget] = useState<string | null>(null);
  const [matches, setMatches] = useState<Destination[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const togglePersona = (id: string) => setSelectedPersonas(prev =>
    prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
  );

  const toggleVibe = (id: string) => setSelectedVibes(prev =>
    prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
  );

  const handleFinish = async () => {
    setLoadingResults(true);

    if (user) {
      await supabase
        .from('profiles')
        .update({
          persona: selectedPersonas[0] ?? null,
          vibe_profile: { personas: selectedPersonas, vibes: selectedVibes, budget },
          budget_style: budget,
        })
        .eq('id', user.id);
    }

    const vibeNames = selectedVibes.map(id => Vibes.find(v => v.id === id)?.name).filter(Boolean) as string[];
    const budgetMax = BUDGETS.find(b => b.id === budget)?.max ?? 999999;

    const { data } = await supabase
      .from('destinations')
      .select('id, place, country, emoji, description, days_rec, budget_usd, rating, tags')
      .lte('budget_usd', budgetMax)
      .order('clone_count', { ascending: false });

    if (data) {
      const scored = (data as Destination[]).map(d => ({
        ...d,
        score: (d.tags ?? []).filter(t => vibeNames.some(v => v.toLowerCase() === t.toLowerCase())).length,
      })).sort((a, b) => (b as any).score - (a as any).score);
      setMatches(scored.slice(0, 5));
    }

    setLoadingResults(false);
    setStep(3);
  };

  const handleReset = () => {
    setStep(0);
    setSelectedPersonas([]);
    setSelectedVibes([]);
    setBudget(null);
    setMatches([]);
  };

  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.25 : 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: isDark ? 1 : 0,
    borderColor: theme.border,
  };

  if (step === 3) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <ScrollView contentContainerStyle={styles.resultContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultEmoji}>🐦</Text>
          <Text style={[styles.resultTitle, { color: theme.text }]}>Your Vibe DNA</Text>
          <Text style={[styles.resultSub, { color: theme.textSecondary }]}>
            {user ? '✅ Saved to your profile' : 'Sign in to save your vibe'}
          </Text>

          <View style={[styles.dnaCard, { backgroundColor: theme.surface, ...cardShadow }]}>
            <View style={styles.dnaSection}>
              <Text style={[styles.dnaLabel, { color: theme.textSecondary }]}>Travel Style</Text>
              <View style={styles.dnaTags}>
                {selectedPersonas.map(id => (
                  <View key={id} style={[styles.dnaTag, { backgroundColor: theme.accentMuted }]}>
                    <Text style={[styles.dnaTagText, { color: theme.accent }]}>
                      {Personas.find(p => p.id === id)?.emoji} {Personas.find(p => p.id === id)?.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.dnaDivider, { backgroundColor: theme.border }]} />
            <View style={styles.dnaSection}>
              <Text style={[styles.dnaLabel, { color: theme.textSecondary }]}>Top Vibes</Text>
              <View style={styles.dnaTags}>
                {selectedVibes.slice(0, 6).map(id => (
                  <View key={id} style={[styles.dnaTag, { backgroundColor: theme.accentMuted }]}>
                    <Text style={[styles.dnaTagText, { color: theme.accent }]}>
                      {Vibes.find(v => v.id === id)?.emoji} {Vibes.find(v => v.id === id)?.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.dnaDivider, { backgroundColor: theme.border }]} />
            <View style={styles.dnaSection}>
              <Text style={[styles.dnaLabel, { color: theme.textSecondary }]}>Budget</Text>
              <Text style={[styles.dnaValue, { color: theme.text }]}>
                {BUDGETS.find(b => b.id === budget)?.label ?? '—'}
              </Text>
            </View>
          </View>

          {matches.length > 0 && (
            <View style={styles.matchSection}>
              <Text style={[styles.matchTitle, { color: theme.text }]}>🎯 Perfect matches for you</Text>
              <Text style={[styles.matchSub, { color: theme.textSecondary }]}>Based on your vibe DNA</Text>
              {matches.map(dest => (
                <TouchableOpacity
                  key={dest.id}
                  style={[styles.matchCard, { backgroundColor: theme.surface, ...cardShadow }]}
                  onPress={() => router.push({ pathname: '/(tabs)/explore/[id]', params: { id: dest.id } } as any)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.matchEmoji}>{dest.emoji}</Text>
                  <View style={styles.matchInfo}>
                    <Text style={[styles.matchName, { color: theme.text }]}>{dest.place}</Text>
                    <Text style={[styles.matchCountry, { color: theme.textSecondary }]}>{dest.country}</Text>
                    <Text style={[styles.matchDesc, { color: theme.textSecondary }]} numberOfLines={1}>{dest.description}</Text>
                  </View>
                  <View style={styles.matchMeta}>
                    <Text style={[styles.matchRating, { color: theme.warning }]}>⭐ {dest.rating}</Text>
                    <Text style={[styles.matchBudget, { color: theme.accent }]}>${(dest.budget_usd / 1000).toFixed(1)}k</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!user && (
            <TouchableOpacity
              style={[styles.saveBtn, {
                backgroundColor: theme.accent,
                shadowColor: theme.accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 5,
              }]}
              onPress={() => router.push('/(auth)/signup')}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>🔒 Save your Vibe DNA</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.resetBtn, { borderColor: theme.border }]}
            onPress={handleReset}
            activeOpacity={0.85}
          >
            <Text style={[styles.resetBtnText, { color: theme.textSecondary }]}>Update My Vibe</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress dots */}
        <View style={styles.progressRow}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[styles.progressDot, {
                backgroundColor: i <= step ? theme.accent : theme.border,
                width: i <= step ? 24 : 8,
              }]}
            />
          ))}
        </View>

        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Who do you travel as?</Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary }]}>Select all that apply</Text>
            <View style={styles.personaGrid}>
              {Personas.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.personaCard, {
                    backgroundColor: selectedPersonas.includes(p.id) ? p.color + '15' : theme.surface,
                    borderColor: selectedPersonas.includes(p.id) ? p.color : theme.border,
                    ...cardShadow,
                  }]}
                  onPress={() => togglePersona(p.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.personaEmoji}>{p.emoji}</Text>
                  <Text style={[styles.personaName, { color: selectedPersonas.includes(p.id) ? p.color : theme.text }]}>
                    {p.name}
                  </Text>
                  <Text style={[styles.personaDesc, { color: theme.textSecondary }]}>{p.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, {
                backgroundColor: theme.accent,
                opacity: selectedPersonas.length === 0 ? 0.4 : 1,
                shadowColor: theme.accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: selectedPersonas.length === 0 ? 0 : 0.3,
                shadowRadius: 10,
                elevation: selectedPersonas.length === 0 ? 0 : 5,
              }]}
              disabled={selectedPersonas.length === 0}
              onPress={() => setStep(1)}
            >
              <Text style={styles.primaryBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>What lights you up?</Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary }]}>Pick your travel vibes</Text>
            <View style={styles.vibeGrid}>
              {Vibes.map(v => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vibeCard, {
                    backgroundColor: selectedVibes.includes(v.id) ? v.color + '20' : theme.surface,
                    borderColor: selectedVibes.includes(v.id) ? v.color : theme.border,
                    ...cardShadow,
                  }]}
                  onPress={() => toggleVibe(v.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.vibeEmoji}>{v.emoji}</Text>
                  <Text style={[styles.vibeName, { color: selectedVibes.includes(v.id) ? v.color : theme.text }]}>
                    {v.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.backBtn, { borderColor: theme.border }]} onPress={() => setStep(0)}>
                <Text style={[styles.backBtnText, { color: theme.textSecondary }]}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, styles.primaryBtnFlex, {
                  backgroundColor: theme.accent,
                  opacity: selectedVibes.length === 0 ? 0.4 : 1,
                }]}
                disabled={selectedVibes.length === 0}
                onPress={() => setStep(2)}
              >
                <Text style={styles.primaryBtnText}>Next →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>What's your travel budget?</Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary }]}>Per person, per trip</Text>
            {BUDGETS.map(b => (
              <TouchableOpacity
                key={b.id}
                style={[styles.budgetCard, {
                  backgroundColor: budget === b.id ? theme.accentMuted : theme.surface,
                  borderColor: budget === b.id ? theme.accent : theme.border,
                  ...cardShadow,
                }]}
                onPress={() => setBudget(b.id)}
                activeOpacity={0.85}
              >
                <Text style={[styles.budgetLabel, { color: theme.text }]}>{b.label}</Text>
                <Text style={[styles.budgetDesc, { color: theme.textSecondary }]}>{b.desc}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.backBtn, { borderColor: theme.border }]} onPress={() => setStep(1)}>
                <Text style={[styles.backBtnText, { color: theme.textSecondary }]}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, styles.primaryBtnFlex, {
                  backgroundColor: theme.accent,
                  opacity: (!budget || loadingResults) ? 0.4 : 1,
                }]}
                disabled={!budget || loadingResults}
                onPress={handleFinish}
              >
                {loadingResults
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryBtnText}>See My Vibe DNA ✨</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 20 },
  progressDot: { height: 8, borderRadius: 4 },
  stepContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  stepTitle: { fontSize: 30, fontWeight: '800', marginBottom: 6, letterSpacing: -0.5 },
  stepSub: { fontSize: 14, marginBottom: 24 },
  personaGrid: { gap: 10, marginBottom: 24 },
  personaCard: { borderRadius: 16, padding: 16, borderWidth: 1.5 },
  personaEmoji: { fontSize: 28, marginBottom: 8 },
  personaName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  personaDesc: { fontSize: 12 },
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  vibeCard: { width: '31%', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1.5 },
  vibeEmoji: { fontSize: 24, marginBottom: 6 },
  vibeName: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  budgetCard: { borderRadius: 16, padding: 18, marginBottom: 10, borderWidth: 1.5 },
  budgetLabel: { fontSize: 16, fontWeight: '700' },
  budgetDesc: { fontSize: 13, marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  backBtn: { borderWidth: 1, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 20, justifyContent: 'center' },
  backBtnText: { fontWeight: '600' },
  primaryBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  primaryBtnFlex: { flex: 1, marginTop: 0 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultContainer: { padding: 24, alignItems: 'center', paddingBottom: 48 },
  resultEmoji: { fontSize: 64, marginBottom: 16, marginTop: 20 },
  resultTitle: { fontSize: 34, fontWeight: '800', marginBottom: 6, letterSpacing: -0.5 },
  resultSub: { fontSize: 14, marginBottom: 28 },
  dnaCard: { borderRadius: 20, padding: 24, width: '100%', marginBottom: 32 },
  dnaSection: { marginBottom: 4 },
  dnaLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  dnaTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dnaTag: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  dnaTagText: { fontSize: 13, fontWeight: '600' },
  dnaValue: { fontSize: 15, fontWeight: '600' },
  dnaDivider: { height: 1, marginVertical: 16 },
  matchSection: { width: '100%', marginBottom: 24 },
  matchTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  matchSub: { fontSize: 13, marginBottom: 16 },
  matchCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginBottom: 10, gap: 12 },
  matchEmoji: { fontSize: 32 },
  matchInfo: { flex: 1 },
  matchName: { fontSize: 16, fontWeight: '700' },
  matchCountry: { fontSize: 12, marginTop: 2 },
  matchDesc: { fontSize: 12, marginTop: 4 },
  matchMeta: { alignItems: 'flex-end', gap: 4 },
  matchRating: { fontSize: 12, fontWeight: '600' },
  matchBudget: { fontSize: 12, fontWeight: '600' },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', width: '100%', marginBottom: 12 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  resetBtn: { borderWidth: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center', width: '100%' },
  resetBtnText: { fontSize: 15, fontWeight: '600' },
});
