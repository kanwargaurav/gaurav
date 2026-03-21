import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function Memories() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Memories</Text>
        <Text style={styles.subtitle}>Capture your adventures 📸</Text>

        <View style={styles.previewCard}>
          <View style={styles.previewGrid}>
            {['🗼', '🏝️', '🏯', '🌅', '🦁', '🌮'].map((e, i) => (
              <View key={i} style={styles.previewTile}>
                <Text style={styles.previewEmoji}>{e}</Text>
              </View>
            ))}
          </View>
          <View style={styles.previewOverlay}>
            <Text style={styles.previewTitle}>Your travel memories</Text>
            <Text style={styles.previewDesc}>Photos, notes, voice memos — all in one place</Text>
          </View>
        </View>

        <View style={styles.featureList}>
          {[
            { icon: '📸', title: 'Photo journals', desc: 'Auto-captioned by AI' },
            { icon: '📍', title: 'Location check-ins', desc: 'Pinned to your map' },
            { icon: '🎤', title: 'Voice memos', desc: 'Record thoughts on the go' },
            { icon: '✍️', title: 'Travel notes', desc: 'Diary entries per day' },
            { icon: '📖', title: 'Trip Stories', desc: 'Auto-generated shareable stories' },
          ].map(f => (
            <View key={f.icon} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/signup')} activeOpacity={0.85}>
          <Feather name="lock" size={16} color="#fff" />
          <Text style={styles.primaryBtnText}>Sign in to capture memories</Text>
        </TouchableOpacity>
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
  previewCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 28, backgroundColor: C.surface },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  previewTile: { width: '33.33%', aspectRatio: 1, backgroundColor: '#131926', alignItems: 'center', justifyContent: 'center' },
  previewEmoji: { fontSize: 36 },
  previewOverlay: { padding: 20 },
  previewTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 4 },
  previewDesc: { fontSize: 13, color: C.muted },
  featureList: { marginBottom: 28, gap: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border },
  featureIcon: { fontSize: 28 },
  featureTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  featureDesc: { fontSize: 12, color: C.muted, marginTop: 2 },
  primaryBtn: { backgroundColor: C.coral, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
