import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Welcome() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="light" />

      {/* Logo */}
      <View style={styles.hero}>
        <Text style={styles.logoEmoji}>🐦</Text>
        <Text style={styles.logoText}>FLOCK</Text>
        <Text style={styles.tagline}>Your world. Your flock. Fly together.</Text>
      </View>

      {/* Feature highlights */}
      <View style={styles.card}>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>✈️</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Explore free, no sign-up</Text>
            <Text style={styles.featureDesc}>Browse thousands of community trip itineraries</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>🤖</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>AI trip planner</Text>
            <Text style={styles.featureDesc}>Describe your dream trip, get a full itinerary instantly</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>👥</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Group travel, simplified</Text>
            <Text style={styles.featureDesc}>AI negotiates the perfect destination for everyone</Text>
          </View>
        </View>
      </View>

      {/* CTAs */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => router.replace('/(tabs)/explore')}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Explore Free  →</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => router.push('/(auth)/login')}
        activeOpacity={0.85}
      >
        <Text style={styles.secondaryBtnText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>No account required to explore destinations</Text>
    </ScrollView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.07)' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingTop: 80, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 40 },
  logoEmoji: { fontSize: 64, marginBottom: 12 },
  logoText: { fontSize: 48, fontWeight: '700', color: C.text, letterSpacing: 4, marginBottom: 12 },
  tagline: { fontSize: 16, color: C.muted, textAlign: 'center', fontStyle: 'italic' },
  card: { backgroundColor: C.surface, borderRadius: 20, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: C.border },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  featureIcon: { fontSize: 28 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: 4 },
  featureDesc: { fontSize: 13, color: C.muted, lineHeight: 18 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 20 },
  primaryBtn: { backgroundColor: C.coral, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { borderWidth: 1.5, borderColor: C.coral, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  secondaryBtnText: { color: C.coral, fontSize: 16, fontWeight: '600' },
  disclaimer: { textAlign: 'center', color: C.muted, fontSize: 12 },
});
