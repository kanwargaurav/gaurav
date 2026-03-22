import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
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
  { id: 'budget', emoji: '💰', label: 'Budget', desc: 'Under $1,000 per person', max: 1000 },
  { id: 'mid', emoji: '✈️', label: 'Mid-range', desc: '$1,000 – $3,000 per person', max: 3000 },
  { id: 'premium', emoji: '⭐', label: 'Premium', desc: '$3,000 – $7,000 per person', max: 7000 },
  { id: 'luxury', emoji: '💎', label: 'Luxury', desc: '$7,000+ per person', max: 999999 },
];

const STEP_LABELS = ['Who are you?', 'Your vibe', 'Budget'];

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

  const togglePersona = (id: string) =>
    setSelectedPersonas(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );

  const toggleVibe = (id: string) =>
    setSelectedVibes(prev =>
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

    const vibeNames = selectedVibes
      .map(id => Vibes.find(v => v.id === id)?.name)
      .filter(Boolean) as string[];
    const budgetMax = BUDGETS.find(b => b.id === budget)?.max ?? 999999;

    const { data } = await supabase
      .from('destinations')
      .select('id, place, country, emoji, description, days_rec, budget_usd, rating, tags')
      .lte('budget_usd', budgetMax)
      .order('clone_count', { ascending: false });

    if (data) {
      const scored = (data as Destination[])
        .map(d => ({
          ...d,
          score: (d.tags ?? []).filter(t =>
            vibeNames.some(v => v.toLowerCase() === t.toLowerCase())
          ).length,
        }))
        .sort((a, b) => (b as any).score - (a as any).score);
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
    shadowOpacity: isDark ? 0.25 : 0.07,
    shadowRadius: 12,
    elevation: 3,
  };

  // ─── Results Screen ───────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <ScrollView
          contentContainerStyle={styles.resultContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultHeroEmoji}>🐦</Text>
          <Text style={[styles.resultTitle, { color: theme.text }]}>Your Vibe DNA</Text>
          <Text style={[styles.resultSub, { color: theme.textSecondary }]}>
            {user ? '✅ Saved to your profile' : 'Sign in to save your vibe'}
          </Text>

          {/* DNA Summary Card */}
          <View
            style={[
              styles.dnaCard,
              { backgroundColor: theme.surface, borderColor: theme.border, ...cardShadow },
            ]}
          >
            <View style={styles.dnaSection}>
              <Text style={[styles.dnaLabel, { color: theme.textSecondary }]}>Travel Style</Text>
              <View style={styles.dnaTags}>
                {selectedPersonas.map(id => (
                  <View key={id} style={[styles.dnaTag, { backgroundColor: theme.accentMuted }]}>
                    <Text style={[styles.dnaTagText, { color: theme.accent }]}>
                      {Personas.find(p => p.id === id)?.emoji}{' '}
                      {Personas.find(p => p.id === id)?.name}
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
                {BUDGETS.find(b => b.id === budget)?.emoji}{' '}
                {BUDGETS.find(b => b.id === budget)?.label ?? '—'}
              </Text>
            </View>
          </View>

          {/* Match Cards */}
          {matches.length > 0 && (
            <View style={styles.matchSection}>
              <Text style={[styles.matchTitle, { color: theme.text }]}>
                🎯 Perfect matches for you
              </Text>
              <Text style={[styles.matchSub, { color: theme.textSecondary }]}>
                Based on your Vibe DNA
              </Text>

              {matches.map((dest, idx) => {
                const maxScore = selectedVibes.length || 1;
                const matchPct = Math.min(
                  100,
                  Math.round(
                    ((maxScore - idx * 0.7) / maxScore) * 100
                  )
                );
                return (
                  <View
                    key={dest.id}
                    style={[
                      styles.matchCard,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        ...cardShadow,
                      },
                    ]}
                  >
                    {/* Match % bar */}
                    <View
                      style={[styles.matchBarBg, { backgroundColor: theme.surfaceSecondary }]}
                    >
                      <View
                        style={[
                          styles.matchBarFill,
                          { backgroundColor: theme.accent, width: `${matchPct}%` as any },
                        ]}
                      />
                    </View>

                    <View style={styles.matchCardBody}>
                      <Text style={styles.matchEmoji}>{dest.emoji}</Text>
                      <View style={styles.matchInfo}>
                        <View style={styles.matchNameRow}>
                          <Text style={[styles.matchName, { color: theme.text }]}>
                            {dest.place}
                          </Text>
                          <View
                            style={[
                              styles.matchPctBadge,
                              { backgroundColor: theme.accentMuted },
                            ]}
                          >
                            <Text style={[styles.matchPctText, { color: theme.accent }]}>
                              {matchPct}% match
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.matchCountry, { color: theme.textSecondary }]}>
                          {dest.country}
                        </Text>
                        <Text
                          style={[styles.matchDesc, { color: theme.textSecondary }]}
                          numberOfLines={1}
                        >
                          {dest.description}
                        </Text>
                        <View style={styles.matchFooter}>
                          <Text style={[styles.matchRating, { color: theme.warning }]}>
                            ⭐ {dest.rating}
                          </Text>
                          <Text style={[styles.matchBudget, { color: theme.textSecondary }]}>
                            ${(dest.budget_usd / 1000).toFixed(1)}k / person
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Plan with AI button */}
                    <TouchableOpacity
                      style={[styles.planBtn, { backgroundColor: theme.accent }]}
                      onPress={() =>
                        router.push({
                          pathname: '/(tabs)/planner',
                          params: { destination: dest.place },
                        } as any)
                      }
                      activeOpacity={0.85}
                    >
                      <Text style={styles.planBtnText}>Plan with AI ✨</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {!user && (
            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: theme.accent,
                  shadowColor: theme.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 5,
                },
              ]}
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
            <Text style={[styles.resetBtnText, { color: theme.textSecondary }]}>
              Update My Vibe
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Step Screens ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Step Progress Bar */}
        <View style={styles.progressContainer}>
          {STEP_LABELS.map((label, i) => (
            <React.Fragment key={i}>
              {/* Dot */}
              <View style={styles.progressItem}>
                <View
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor: i <= step ? theme.accent : theme.border,
                      borderColor: i <= step ? theme.accent : theme.border,
                    },
                  ]}
                >
                  {i < step && (
                    <Text style={styles.progressCheckmark}>✓</Text>
                  )}
                  {i === step && <View style={styles.progressDotInner} />}
                </View>
                <Text
                  style={[
                    styles.progressLabel,
                    { color: i <= step ? theme.accent : theme.textTertiary },
                  ]}
                >
                  {label}
                </Text>
              </View>

              {/* Connector line */}
              {i < STEP_LABELS.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    { backgroundColor: i < step ? theme.accent : theme.border },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* ── Step 0: Persona ── */}
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeroEmoji}>🧳</Text>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Who do you travel as?</Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary }]}>
              Select all that apply
            </Text>

            <View style={styles.personaGrid}>
              {Personas.map(p => {
                const selected = selectedPersonas.includes(p.id);
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.personaCard,
                      {
                        backgroundColor: selected ? theme.accentMuted : theme.surface,
                        borderColor: selected ? theme.accent : theme.border,
                        ...cardShadow,
                      },
                    ]}
                    onPress={() => togglePersona(p.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.personaEmoji}>{p.emoji}</Text>
                    <Text
                      style={[
                        styles.personaName,
                        { color: selected ? theme.accent : theme.text },
                      ]}
                    >
                      {p.name}
                    </Text>
                    {selected && (
                      <View
                        style={[styles.personaCheck, { backgroundColor: theme.accent }]}
                      >
                        <Text style={styles.personaCheckMark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: theme.accent,
                  opacity: selectedPersonas.length === 0 ? 0.4 : 1,
                  shadowColor: theme.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: selectedPersonas.length === 0 ? 0 : 0.3,
                  shadowRadius: 10,
                  elevation: selectedPersonas.length === 0 ? 0 : 5,
                },
              ]}
              disabled={selectedPersonas.length === 0}
              onPress={() => setStep(1)}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 1: Vibes ── */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <TouchableOpacity style={styles.backChevron} onPress={() => setStep(0)}>
              <Text style={[styles.backChevronText, { color: theme.textSecondary }]}>
                ‹ Back
              </Text>
            </TouchableOpacity>

            <Text style={styles.stepHeroEmoji}>✨</Text>
            <Text style={[styles.stepTitle, { color: theme.text }]}>What lights you up?</Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary }]}>
              Pick your travel vibes — choose as many as you like
            </Text>

            <View style={styles.vibeChipsWrap}>
              {Vibes.map(v => {
                const selected = selectedVibes.includes(v.id);
                return (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.vibeChip,
                      {
                        backgroundColor: selected ? v.color : theme.surface,
                        borderColor: selected ? v.color : theme.border,
                        ...cardShadow,
                      },
                    ]}
                    onPress={() => toggleVibe(v.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.vibeChipEmoji}>{v.emoji}</Text>
                    <Text
                      style={[
                        styles.vibeChipName,
                        { color: selected ? '#fff' : theme.text },
                      ]}
                    >
                      {v.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: theme.accent,
                  opacity: selectedVibes.length === 0 ? 0.4 : 1,
                  shadowColor: theme.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: selectedVibes.length === 0 ? 0 : 0.3,
                  shadowRadius: 10,
                  elevation: selectedVibes.length === 0 ? 0 : 5,
                },
              ]}
              disabled={selectedVibes.length === 0}
              onPress={() => setStep(2)}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 2: Budget ── */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <TouchableOpacity style={styles.backChevron} onPress={() => setStep(1)}>
              <Text style={[styles.backChevronText, { color: theme.textSecondary }]}>
                ‹ Back
              </Text>
            </TouchableOpacity>

            <Text style={styles.stepHeroEmoji}>💸</Text>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              What's your travel budget?
            </Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary }]}>
              Per person, per trip
            </Text>

            <View style={styles.budgetList}>
              {BUDGETS.map(b => {
                const selected = budget === b.id;
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.budgetCard,
                      {
                        backgroundColor: selected ? theme.accentMuted : theme.surface,
                        borderColor: theme.border,
                        borderLeftColor: selected ? theme.accent : theme.border,
                        borderLeftWidth: selected ? 4 : 1,
                        ...cardShadow,
                      },
                    ]}
                    onPress={() => setBudget(b.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.budgetEmoji}>{b.emoji}</Text>
                    <View style={styles.budgetInfo}>
                      <Text
                        style={[
                          styles.budgetLabel,
                          { color: selected ? theme.accent : theme.text },
                        ]}
                      >
                        {b.label}
                      </Text>
                      <Text style={[styles.budgetDesc, { color: theme.textSecondary }]}>
                        {b.desc}
                      </Text>
                    </View>
                    {selected && (
                      <View style={[styles.budgetCheck, { backgroundColor: theme.accent }]}>
                        <Text style={styles.budgetCheckMark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: theme.accent,
                  opacity: !budget || loadingResults ? 0.4 : 1,
                  shadowColor: theme.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: !budget || loadingResults ? 0 : 0.3,
                  shadowRadius: 10,
                  elevation: !budget || loadingResults ? 0 : 5,
                },
              ]}
              disabled={!budget || loadingResults}
              onPress={handleFinish}
            >
              {loadingResults ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>See My Vibe DNA ✨</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Progress Bar ──────────────────────────────────────────────────────────────
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 24,
  },
  progressItem: { alignItems: 'center', gap: 6 },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  progressCheckmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  progressLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.2, textAlign: 'center', maxWidth: 60 },
  progressLine: { flex: 1, height: 2, marginBottom: 18, marginHorizontal: 4 },

  // ── Step Shared ───────────────────────────────────────────────────────────────
  stepContainer: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8 },
  stepHeroEmoji: { fontSize: 52, marginBottom: 12, marginTop: 20, textAlign: 'center' },
  stepTitle: { fontSize: 28, fontWeight: '800', marginBottom: 6, letterSpacing: -0.5, textAlign: 'center' },
  stepSub: { fontSize: 14, marginBottom: 28, textAlign: 'center', lineHeight: 20 },

  backChevron: { paddingVertical: 8, paddingBottom: 0 },
  backChevronText: { fontSize: 16, fontWeight: '600' },

  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // ── Persona Grid ──────────────────────────────────────────────────────────────
  personaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
  },
  personaCard: {
    width: '47%',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    position: 'relative',
  },
  personaEmoji: { fontSize: 36, marginBottom: 10 },
  personaName: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  personaCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaCheckMark: { color: '#fff', fontSize: 11, fontWeight: '800' },

  // ── Vibe Chips ────────────────────────────────────────────────────────────────
  vibeChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  vibeChipEmoji: { fontSize: 16 },
  vibeChipName: { fontSize: 13, fontWeight: '600' },

  // ── Budget Cards ──────────────────────────────────────────────────────────────
  budgetList: { gap: 10, marginBottom: 4 },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  budgetEmoji: { fontSize: 28 },
  budgetInfo: { flex: 1 },
  budgetLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  budgetDesc: { fontSize: 13 },
  budgetCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetCheckMark: { color: '#fff', fontSize: 13, fontWeight: '800' },

  // ── Results ───────────────────────────────────────────────────────────────────
  resultContainer: { padding: 24, alignItems: 'center', paddingBottom: 56 },
  resultHeroEmoji: { fontSize: 72, marginBottom: 16, marginTop: 24 },
  resultTitle: { fontSize: 32, fontWeight: '800', marginBottom: 6, letterSpacing: -0.5 },
  resultSub: { fontSize: 14, marginBottom: 32 },

  dnaCard: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 36,
    borderWidth: 1,
  },
  dnaSection: { marginBottom: 4 },
  dnaLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  dnaTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dnaTag: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  dnaTagText: { fontSize: 13, fontWeight: '600' },
  dnaValue: { fontSize: 15, fontWeight: '600' },
  dnaDivider: { height: 1, marginVertical: 16 },

  matchSection: { width: '100%', marginBottom: 24 },
  matchTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  matchSub: { fontSize: 13, marginBottom: 16 },

  matchCard: {
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  matchBarBg: {
    height: 4,
    width: '100%',
  },
  matchBarFill: {
    height: 4,
    borderRadius: 2,
  },
  matchCardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 14,
  },
  matchEmoji: { fontSize: 40, marginTop: 2 },
  matchInfo: { flex: 1 },
  matchNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  matchName: { fontSize: 17, fontWeight: '800' },
  matchPctBadge: { borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  matchPctText: { fontSize: 11, fontWeight: '700' },
  matchCountry: { fontSize: 12, marginTop: 2 },
  matchDesc: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  matchFooter: { flexDirection: 'row', gap: 12, marginTop: 8 },
  matchRating: { fontSize: 12, fontWeight: '600' },
  matchBudget: { fontSize: 12 },

  planBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  planBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  saveBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  resetBtn: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  resetBtnText: { fontSize: 15, fontWeight: '600' },
});
