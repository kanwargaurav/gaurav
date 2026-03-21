import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function Profile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        {/* Guest state */}
        <View style={styles.guestCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🐦</Text>
          </View>
          <Text style={styles.guestTitle}>You're exploring as a guest</Text>
          <Text style={styles.guestDesc}>Sign in to save trips, track memories, and connect with other travellers</Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/signup')} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Create Free Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/login')} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Features preview */}
        <Text style={styles.sectionTitle}>What you unlock</Text>
        {[
          { icon: '✈️', label: 'Save & clone trip itineraries' },
          { icon: '📸', label: 'Capture memories from your trips' },
          { icon: '👥', label: 'Create and join group trips' },
          { icon: '🤖', label: 'Unlimited AI trip planning' },
          { icon: '🐦', label: 'Follow other travellers' },
          { icon: '🌍', label: 'Share your Trip Stories' },
        ].map(f => (
          <View key={f.icon} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureLabel}>{f.label}</Text>
            <Feather name="check" size={16} color="#0BBFA0" />
          </View>
        ))}

        {/* Settings links */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {[
            { icon: 'moon', label: 'Dark mode', value: 'On' },
            { icon: 'bell', label: 'Notifications', value: 'Off' },
            { icon: 'globe', label: 'Language', value: 'English' },
            { icon: 'shield', label: 'Privacy & Security', value: '' },
            { icon: 'help-circle', label: 'Help & Support', value: '' },
          ].map(s => (
            <TouchableOpacity key={s.label} style={styles.settingRow} activeOpacity={0.7}>
              <Feather name={s.icon as any} size={18} color="rgba(237,232,223,0.5)" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>{s.label}</Text>
              <View style={styles.settingRight}>
                {s.value ? <Text style={styles.settingValue}>{s.value}</Text> : null}
                <Feather name="chevron-right" size={16} color="rgba(237,232,223,0.3)" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>FLOCK v1.0.0 · Made with ❤️</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.07)' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: C.text, marginBottom: 20 },
  guestCard: { backgroundColor: C.surface, borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: C.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#131926', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: C.coral },
  avatarEmoji: { fontSize: 36 },
  guestTitle: { fontSize: 20, fontWeight: '700', color: C.text, textAlign: 'center', marginBottom: 8 },
  guestDesc: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  primaryBtn: { backgroundColor: C.coral, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 32, alignItems: 'center', width: '100%', marginBottom: 10 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 32, alignItems: 'center', width: '100%' },
  secondaryBtnText: { color: C.muted, fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  featureIcon: { fontSize: 20, width: 28 },
  featureLabel: { flex: 1, fontSize: 14, color: C.text },
  settingsSection: { marginTop: 28 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  settingIcon: { marginRight: 14 },
  settingLabel: { flex: 1, fontSize: 15, color: C.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingValue: { fontSize: 13, color: C.muted },
  version: { textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 32 },
});
