import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { DestinationMap } from '../../../constants/destinations';

export default function DestinationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const destination = DestinationMap[id ?? ''];

  if (!destination) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Destination not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleClone = () => Alert.alert('Sign in to clone', 'Create a free account to save and customise this itinerary.', [
    { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
    { text: 'Cancel', style: 'cancel' },
  ]);

  const handlePlanWithAI = () => router.push('/(tabs)/planner');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.heroSection}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="rgba(237,232,223,0.7)" />
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>{destination.emoji}</Text>
          <Text style={styles.heroName}>{destination.name}</Text>
          <Text style={styles.heroCountry}>{destination.country}</Text>
          <Text style={styles.heroTagline}>{destination.tagline}</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{destination.days}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>${(destination.budgetUSD / 1000).toFixed(1)}k</Text>
            <Text style={styles.statLabel}>Budget</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>⭐ {destination.ratingAverage}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{destination.cloneCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Cloned</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionText}>{destination.description}</Text>
          </View>

          {/* Highlights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            {destination.highlights.map((h, i) => (
              <View key={i} style={styles.highlightRow}>
                <Text style={styles.highlightDot}>✦</Text>
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>

          {/* Best season */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>📅 Best time to visit</Text>
            <Text style={styles.infoValue}>{destination.bestSeason}</Text>
          </View>

          {/* Hidden gem */}
          <View style={[styles.infoCard, styles.gemCard]}>
            <Text style={styles.gemLabel}>🔮 FLOCK Secret</Text>
            <Text style={styles.gemText}>{destination.hiddenGem}</Text>
          </View>

          {/* Tags */}
          <View style={styles.tagRow}>
            {destination.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTAs */}
      <View style={styles.ctaBar}>
        <TouchableOpacity style={styles.aiBtn} onPress={handlePlanWithAI} activeOpacity={0.85}>
          <Feather name="edit-2" size={16} color="#FF5533" />
          <Text style={styles.aiBtnText}>Plan with AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cloneBtn} onPress={handleClone} activeOpacity={0.85}>
          <Text style={styles.cloneBtnText}>⚡ Clone Trip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.07)', amber: '#F5A020' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { color: C.muted, fontSize: 16 },
  backBtn: { padding: 16 },
  backText: { color: C.muted, fontSize: 16 },
  heroSection: { alignItems: 'center', paddingTop: 8, paddingBottom: 28, paddingHorizontal: 24 },
  heroEmoji: { fontSize: 72, marginBottom: 16 },
  heroName: { fontSize: 36, fontWeight: '800', color: C.text, textAlign: 'center' },
  heroCountry: { fontSize: 16, color: C.muted, marginTop: 4, marginBottom: 12 },
  heroTagline: { fontSize: 15, color: C.muted, textAlign: 'center', fontStyle: 'italic' },
  statsRow: { flexDirection: 'row', backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 16, paddingVertical: 20, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '700', color: C.coral },
  statLabel: { fontSize: 11, color: C.muted, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: C.border },
  body: { padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 10 },
  sectionText: { fontSize: 14, color: C.muted, lineHeight: 22 },
  highlightRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  highlightDot: { color: C.coral, marginRight: 10, fontSize: 14, lineHeight: 22 },
  highlightText: { fontSize: 14, color: C.muted, flex: 1, lineHeight: 22 },
  infoCard: { backgroundColor: C.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  infoLabel: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 },
  infoValue: { fontSize: 14, color: C.muted },
  gemCard: { borderColor: 'rgba(119,85,240,0.3)', backgroundColor: 'rgba(119,85,240,0.08)' },
  gemLabel: { fontSize: 13, fontWeight: '700', color: '#7755F0', marginBottom: 6 },
  gemText: { fontSize: 14, color: C.muted, lineHeight: 21 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: C.surface, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: C.border },
  tagText: { color: C.muted, fontSize: 12, fontWeight: '600' },
  ctaBar: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 24, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bg },
  aiBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: C.coral, borderRadius: 14, paddingVertical: 14 },
  aiBtnText: { color: C.coral, fontWeight: '700', fontSize: 15 },
  cloneBtn: { flex: 2, backgroundColor: C.coral, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cloneBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
