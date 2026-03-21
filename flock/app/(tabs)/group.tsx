import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function Group() {
  const router = useRouter();

  const handleCreate = () => {
    // Soft gate — prompt sign in
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Group Trips</Text>
        <Text style={styles.subtitle}>Travel together, plan together 🐦</Text>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>👥</Text>
          <Text style={styles.heroTitle}>Invite your flock</Text>
          <Text style={styles.heroDesc}>
            Each person answers privately about dates, budget & vibes.
            Our AI negotiates the perfect destination that works for everyone.
          </Text>
        </View>

        {/* How it works */}
        <Text style={styles.sectionTitle}>How it works</Text>
        {[
          { icon: '📨', step: '1', title: 'Invite your group', desc: 'Share a link — works on any platform' },
          { icon: '🗳️', step: '2', title: 'Everyone votes privately', desc: 'Dates, budget, vibes — no pressure' },
          { icon: '🤖', step: '3', title: 'AI finds the perfect match', desc: '3 ranked destinations with fit scores' },
          { icon: '✈️', step: '4', title: 'Build the itinerary together', desc: 'Shared planning, real-time updates' },
        ].map(item => (
          <View key={item.step} style={styles.stepCard}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepEmoji}>{item.icon}</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        {/* CTAs */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate} activeOpacity={0.85}>
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Create Group Trip</Text>
        </TouchableOpacity>

        <View style={styles.joinRow}>
          <Text style={styles.joinText}>Have an invite code? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.joinLink}>Join a trip →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.07)' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 14, color: C.muted, marginTop: 4, marginBottom: 24 },
  heroCard: { backgroundColor: C.surface, borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: C.border },
  heroEmoji: { fontSize: 48, marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: C.text, textAlign: 'center', marginBottom: 10 },
  heroDesc: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 14 },
  stepCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10, gap: 14, borderWidth: 1, borderColor: C.border },
  stepIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,85,51,0.12)', alignItems: 'center', justifyContent: 'center' },
  stepEmoji: { fontSize: 22 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  stepDesc: { fontSize: 13, color: C.muted, lineHeight: 18 },
  primaryBtn: { backgroundColor: C.coral, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, marginBottom: 16 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  joinRow: { flexDirection: 'row', justifyContent: 'center' },
  joinText: { color: C.muted, fontSize: 14 },
  joinLink: { color: C.coral, fontSize: 14, fontWeight: '600' },
});
