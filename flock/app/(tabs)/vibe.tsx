import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Vibes } from '../../constants/vibes';
import { Personas } from '../../constants/personas';

export default function VibeScreen() {
  const [step, setStep] = useState(0);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [budget, setBudget] = useState<string | null>(null);

  const togglePersona = (id: string) => setSelectedPersonas(prev =>
    prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
  );

  const toggleVibe = (id: string) => setSelectedVibes(prev =>
    prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
  );

  const budgets = [
    { id: 'budget', label: '💰 Budget', desc: 'Under $1,000' },
    { id: 'mid', label: '✈️ Mid-range', desc: '$1k – $3k' },
    { id: 'premium', label: '⭐ Premium', desc: '$3k – $7k' },
    { id: 'luxury', label: '💎 Luxury', desc: '$7k+' },
  ];

  if (step === 3) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Text style={styles.resultEmoji}>🐦</Text>
          <Text style={styles.resultTitle}>Your Vibe DNA</Text>
          <Text style={styles.resultSub}>Here's what makes you, you</Text>

          <View style={styles.dnaCard}>
            <View style={styles.dnaSection}>
              <Text style={styles.dnaLabel}>Travel Style</Text>
              <View style={styles.dnaTags}>
                {selectedPersonas.map(id => (
                  <View key={id} style={styles.dnaTag}>
                    <Text style={styles.dnaTagText}>{Personas.find(p => p.id === id)?.emoji} {Personas.find(p => p.id === id)?.name}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.dnaDivider} />
            <View style={styles.dnaSection}>
              <Text style={styles.dnaLabel}>Top Vibes</Text>
              <View style={styles.dnaTags}>
                {selectedVibes.slice(0, 4).map(id => (
                  <View key={id} style={styles.dnaTag}>
                    <Text style={styles.dnaTagText}>{Vibes.find(v => v.id === id)?.emoji} {Vibes.find(v => v.id === id)?.name}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.dnaDivider} />
            <View style={styles.dnaSection}>
              <Text style={styles.dnaLabel}>Budget</Text>
              <Text style={styles.dnaValue}>{budgets.find(b => b.id === budget)?.label ?? '—'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(0)}>
            <Text style={styles.primaryBtnText}>Update My Vibe</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.progressRow}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
          ))}
        </View>

        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Who do you travel as?</Text>
            <Text style={styles.stepSub}>Select all that apply</Text>
            <View style={styles.personaGrid}>
              {Personas.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.personaCard, selectedPersonas.includes(p.id) && { borderColor: p.color, backgroundColor: p.color + '15' }]}
                  onPress={() => togglePersona(p.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.personaEmoji}>{p.emoji}</Text>
                  <Text style={[styles.personaName, selectedPersonas.includes(p.id) && { color: p.color }]}>{p.name}</Text>
                  <Text style={styles.personaDesc}>{p.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, selectedPersonas.length === 0 && styles.primaryBtnDisabled]}
              disabled={selectedPersonas.length === 0}
              onPress={() => setStep(1)}
            >
              <Text style={styles.primaryBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What lights you up?</Text>
            <Text style={styles.stepSub}>Pick your travel vibes</Text>
            <View style={styles.vibeGrid}>
              {Vibes.map(v => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vibeCard, selectedVibes.includes(v.id) && { borderColor: v.color, backgroundColor: v.color + '20' }]}
                  onPress={() => toggleVibe(v.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.vibeEmoji}>{v.emoji}</Text>
                  <Text style={[styles.vibeName, selectedVibes.includes(v.id) && { color: v.color }]}>{v.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(0)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, styles.primaryBtnFlex, selectedVibes.length === 0 && styles.primaryBtnDisabled]}
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
            <Text style={styles.stepTitle}>What's your travel budget?</Text>
            <Text style={styles.stepSub}>Per person, per trip</Text>
            {budgets.map(b => (
              <TouchableOpacity
                key={b.id}
                style={[styles.budgetCard, budget === b.id && styles.budgetCardActive]}
                onPress={() => setBudget(b.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.budgetLabel}>{b.label}</Text>
                <Text style={styles.budgetDesc}>{b.desc}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, styles.primaryBtnFlex, !budget && styles.primaryBtnDisabled]}
                disabled={!budget}
                onPress={() => setStep(3)}
              >
                <Text style={styles.primaryBtnText}>See My Vibe DNA ✨</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.10)' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 20 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  progressDotActive: { backgroundColor: C.coral, width: 24 },
  stepContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  stepTitle: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 6 },
  stepSub: { fontSize: 14, color: C.muted, marginBottom: 24 },
  personaGrid: { gap: 10, marginBottom: 24 },
  personaCard: { backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: C.border },
  personaEmoji: { fontSize: 28, marginBottom: 8 },
  personaName: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  personaDesc: { fontSize: 12, color: C.muted },
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  vibeCard: { width: '31%', backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  vibeEmoji: { fontSize: 24, marginBottom: 6 },
  vibeName: { fontSize: 11, fontWeight: '600', color: C.text, textAlign: 'center' },
  budgetCard: { backgroundColor: C.surface, borderRadius: 14, padding: 18, marginBottom: 10, borderWidth: 1.5, borderColor: C.border },
  budgetCardActive: { borderColor: C.coral, backgroundColor: 'rgba(255,85,51,0.1)' },
  budgetLabel: { fontSize: 16, fontWeight: '700', color: C.text },
  budgetDesc: { fontSize: 13, color: C.muted, marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  backBtn: { borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 20, justifyContent: 'center' },
  backBtnText: { color: C.muted, fontWeight: '600' },
  primaryBtn: { backgroundColor: C.coral, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnFlex: { flex: 1, marginTop: 0 },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultContainer: { padding: 24, alignItems: 'center' },
  resultEmoji: { fontSize: 64, marginBottom: 16, marginTop: 20 },
  resultTitle: { fontSize: 32, fontWeight: '800', color: C.text, marginBottom: 6 },
  resultSub: { fontSize: 15, color: C.muted, marginBottom: 32 },
  dnaCard: { backgroundColor: C.surface, borderRadius: 20, padding: 24, width: '100%', borderWidth: 1, borderColor: C.border, marginBottom: 32 },
  dnaSection: { marginBottom: 4 },
  dnaLabel: { fontSize: 12, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  dnaTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dnaTag: { backgroundColor: 'rgba(255,85,51,0.15)', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  dnaTagText: { color: C.coral, fontSize: 13, fontWeight: '600' },
  dnaValue: { color: C.text, fontSize: 15, fontWeight: '600' },
  dnaDivider: { height: 1, backgroundColor: C.border, marginVertical: 16 },
});
