import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';

type Destination = {
  id: string;
  place: string;
  country: string;
  emoji: string;
  description: string;
  days_rec: number;
  budget_usd: number;
  rating: number;
  clone_count: number;
  tags: string[];
  persona_tag: string;
  is_featured: boolean;
};

const PERSONA_TIPS: Record<string, string[]> = {
  couple: ['Book restaurants 2+ weeks ahead', 'Ask for romantic seating or sunset views', 'Avoid peak tourist hours — go early or late'],
  family: ['Check stroller/wheelchair access at attractions', 'Look for family menus and high chairs', 'Build in nap/rest time each afternoon'],
  solo: ['Stay in social hostels or co-living spaces', 'Join free walking tours to meet people', 'Notify someone of your daily itinerary'],
  friends: ['Use Splitwise or Tricount for shared expenses', 'Book group tables at least 1 week ahead', 'Agree on a daily spend cap before you go'],
  default: ['Download offline maps before arriving', 'Get a local SIM card at the airport', 'Book top attractions skip-the-line in advance'],
};

export default function DestinationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [dest, setDest] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (data) setDest(data as Destination);
        if (error) console.warn(error.message);
        setLoading(false);
      });
  }, [id]);

  const handlePlanWithAI = () => {
    router.push({ pathname: '/(tabs)/planner', params: { prompt: `Plan a ${dest?.days_rec}-day trip to ${dest?.place}, ${dest?.country}` } } as any);
  };

  const handleClone = async () => {
    if (!user) {
      Alert.alert('Sign in to clone', 'Create a free account to save and customise this itinerary.', [
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (!dest) return;
    setCloning(true);
    const { error } = await supabase.from('trips').insert({
      user_id: user.id,
      title: `My ${dest.place} Trip`,
      destination: dest.place,
      dest_id: dest.id,
      cover_emoji: dest.emoji,
      days: dest.days_rec,
      budget_usd: dest.budget_usd,
      tags: dest.tags,
      persona: dest.persona_tag,
      status: 'planning',
    });
    setCloning(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('✅ Trip cloned!', `${dest.place} has been added to your trips.`, [
        { text: 'View Profile', onPress: () => router.push('/(tabs)/profile') },
        { text: 'Keep Exploring', style: 'cancel' },
      ]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FF5533" />
        </View>
      </SafeAreaView>
    );
  }

  if (!dest) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.loadingBox}>
          <Text style={{ color: C.muted, fontSize: 16 }}>Destination not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tips = PERSONA_TIPS[dest.persona_tag ?? 'default'] ?? PERSONA_TIPS.default;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>{dest.emoji}</Text>
          <Text style={styles.heroName}>{dest.place}</Text>
          <Text style={styles.heroCountry}>{dest.country}</Text>
          {dest.is_featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>⭐ Featured Destination</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{dest.days_rec}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>${(dest.budget_usd / 1000).toFixed(1)}k</Text>
            <Text style={styles.statLabel}>Budget</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>⭐ {dest.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>⚡{(dest.clone_count / 1000).toFixed(1)}k</Text>
            <Text style={styles.statLabel}>Cloned</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.desc}>{dest.description}</Text>
          </View>

          {/* Tags */}
          {dest.tags?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vibe Tags</Text>
              <View style={styles.tagRow}>
                {dest.tags.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* AI Itinerary CTA */}
          <View style={styles.aiCard}>
            <Text style={styles.aiEmoji}>🤖</Text>
            <Text style={styles.aiTitle}>Get your personalised itinerary</Text>
            <Text style={styles.aiDesc}>
              Tell FLOCK who you're travelling with and your budget — get a full day-by-day plan with named restaurants, hotels, and hidden gems.
            </Text>
            <TouchableOpacity style={styles.aiBtn} onPress={handlePlanWithAI} activeOpacity={0.85}>
              <Text style={styles.aiBtnText}>Plan {dest.place} with AI →</Text>
            </TouchableOpacity>
          </View>

          {/* Practical Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Practical Tips</Text>
            {tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipDot}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Budget breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estimated Budget</Text>
            {[
              { label: 'Flights (return)', val: `$${Math.round(dest.budget_usd * 0.4).toLocaleString()}` },
              { label: `Hotels (${dest.days_rec} nights)`, val: `$${Math.round(dest.budget_usd * 0.35).toLocaleString()}` },
              { label: 'Food & activities', val: `$${Math.round(dest.budget_usd * 0.25).toLocaleString()}` },
            ].map(row => (
              <View key={row.label} style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>{row.label}</Text>
                <Text style={styles.budgetVal}>{row.val}</Text>
              </View>
            ))}
            <View style={[styles.budgetRow, styles.budgetTotal]}>
              <Text style={styles.budgetTotalLabel}>Total estimate</Text>
              <Text style={styles.budgetTotalVal}>${dest.budget_usd.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTAs */}
      <View style={styles.ctaBar}>
        <TouchableOpacity style={styles.planBtn} onPress={handlePlanWithAI} activeOpacity={0.85}>
          <Text style={styles.planBtnText}>🤖 Plan with AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cloneBtn} onPress={handleClone} disabled={cloning} activeOpacity={0.85}>
          {cloning
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.cloneBtnText}>⚡ Clone Trip</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', surfaceHigh: '#131926', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.07)' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  backText: { color: C.muted, fontSize: 16 },
  hero: { alignItems: 'center', paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: C.border },
  heroEmoji: { fontSize: 72, marginBottom: 12, marginTop: 8 },
  heroName: { fontSize: 36, fontWeight: '800', color: C.text, textAlign: 'center' },
  heroCountry: { fontSize: 16, color: C.muted, marginTop: 4 },
  featuredBadge: { marginTop: 12, backgroundColor: 'rgba(245,160,32,0.15)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  featuredText: { color: '#F5A020', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: C.border },
  stat: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 18, fontWeight: '700', color: C.text },
  statLabel: { fontSize: 11, color: C.muted, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: C.border },
  body: { padding: 20, paddingBottom: 110 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 12 },
  desc: { fontSize: 15, color: C.muted, lineHeight: 24 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: C.surfaceHigh, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: C.border },
  tagText: { color: C.muted, fontSize: 13 },
  aiCard: { backgroundColor: '#1A0E06', borderRadius: 16, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: 'rgba(255,85,51,0.2)', alignItems: 'center' },
  aiEmoji: { fontSize: 40, marginBottom: 10 },
  aiTitle: { fontSize: 18, fontWeight: '700', color: C.text, textAlign: 'center', marginBottom: 8 },
  aiDesc: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  aiBtn: { backgroundColor: C.coral, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28 },
  aiBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tipDot: { color: C.coral, fontSize: 16, lineHeight: 22 },
  tipText: { flex: 1, color: C.muted, fontSize: 14, lineHeight: 22 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  budgetLabel: { color: C.muted, fontSize: 14 },
  budgetVal: { color: C.text, fontSize: 14, fontWeight: '600' },
  budgetTotal: { borderBottomWidth: 0, marginTop: 4 },
  budgetTotalLabel: { color: C.text, fontSize: 15, fontWeight: '700' },
  budgetTotalVal: { color: C.coral, fontSize: 16, fontWeight: '800' },
  ctaBar: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bg },
  planBtn: { flex: 1, borderWidth: 1.5, borderColor: C.coral, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  planBtnText: { color: C.coral, fontWeight: '700', fontSize: 15 },
  cloneBtn: { flex: 2, backgroundColor: C.coral, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  cloneBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
