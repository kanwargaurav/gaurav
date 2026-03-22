import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

type Trip = {
  id: string;
  title: string;
  destination: string;
  cover_emoji: string;
  days: number;
  status: string;
  created_at: string;
};

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  persona: string | null;
  trips_count: number;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, isDark } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    Promise.all([
      supabase.from('profiles').select('id, username, full_name, persona, trips_count').eq('id', user.id).single(),
      supabase.from('trips').select('id, title, destination, cover_emoji, days, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ]).then(([profileRes, tripsRes]) => {
      if (profileRes.data) setProfile(profileRes.data as Profile);
      if (tripsRes.data) setTrips(tripsRes.data as Trip[]);
      setLoadingData(false);
    });
  }, [user]);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getStatusLabel = (status: string) => {
    if (status === 'planning') return '✏️ Planning';
    if (status === 'booked') return '🎟️ Booked';
    if (status === 'completed') return '✅ Completed';
    return status;
  };

  const getStatusColor = (status: string) => {
    if (status === 'planning') return theme.warning;
    if (status === 'booked') return '#7755F0';
    if (status === 'completed') return theme.success;
    return theme.textSecondary;
  };

  // Guest view
  if (!authLoading && !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>

          <View style={[styles.guestCard, {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.25 : 0.06,
            shadowRadius: 12,
            elevation: 4,
            borderWidth: isDark ? 1 : 0,
          }]}>
            <View style={[styles.avatar, { backgroundColor: theme.accentMuted, borderColor: theme.accent }]}>
              <Text style={styles.avatarEmoji}>🐦</Text>
            </View>
            <Text style={[styles.guestTitle, { color: theme.text }]}>You're exploring as a guest</Text>
            <Text style={[styles.guestDesc, { color: theme.textSecondary }]}>
              Sign in to save trips, track memories, and connect with travellers
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
              onPress={() => router.push('/(auth)/signup')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Create Free Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: theme.border }]}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>What you unlock</Text>
          {[
            { icon: '✈️', label: 'Save & clone trip itineraries' },
            { icon: '📸', label: 'Capture memories from your trips' },
            { icon: '👥', label: 'Create and join group trips' },
            { icon: '🤖', label: 'Unlimited AI trip planning' },
            { icon: '🌍', label: 'Share your Trip Stories' },
          ].map(f => (
            <View key={f.icon} style={[styles.featureRow, { borderBottomColor: theme.border }]}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={[styles.featureLabel, { color: theme.text }]}>{f.label}</Text>
              <Text style={{ color: theme.success, fontSize: 16 }}>✓</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Loading auth
  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.loadingBox}><ActivityIndicator size="large" color={theme.accent} /></View>
      </SafeAreaView>
    );
  }

  // Logged-in view
  const displayName = profile?.full_name ?? profile?.username ?? user?.email?.split('@')[0] ?? 'Traveller';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarFilled, { backgroundColor: theme.accent }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>{displayName}</Text>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
            {profile?.persona && (
              <View style={[styles.personaBadge, { backgroundColor: theme.accentMuted }]}>
                <Text style={[styles.personaText, { color: theme.accent }]}>🧭 {profile.persona}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.2 : 0.05,
          shadowRadius: 10,
          elevation: 3,
          borderWidth: isDark ? 1 : 0,
        }]}>
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: theme.text }]}>{trips.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Trips</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: theme.text }]}>{trips.filter(t => t.status === 'completed').length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: theme.text }]}>{trips.reduce((s, t) => s + (t.days ?? 0), 0)}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Days Planned</Text>
          </View>
        </View>

        {/* My Trips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>My Trips</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={[styles.sectionAction, { color: theme.accent }]}>+ Add trip</Text>
            </TouchableOpacity>
          </View>

          {loadingData ? (
            <ActivityIndicator color={theme.accent} style={{ marginVertical: 20 }} />
          ) : trips.length === 0 ? (
            <View style={[styles.emptyTrips, {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: isDark ? 1 : 0,
            }]}>
              <Text style={styles.emptyEmoji}>✈️</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No trips saved yet</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                <Text style={[styles.emptyAction, { color: theme.accent }]}>Browse destinations →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            trips.map(trip => (
              <View key={trip.id} style={[styles.tripCard, {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.15 : 0.04,
                shadowRadius: 6,
                elevation: 2,
                borderWidth: isDark ? 1 : 0,
              }]}>
                <Text style={styles.tripEmoji}>{trip.cover_emoji}</Text>
                <View style={styles.tripInfo}>
                  <Text style={[styles.tripTitle, { color: theme.text }]}>{trip.title}</Text>
                  <Text style={[styles.tripMeta, { color: theme.textSecondary }]}>
                    {trip.destination} · {trip.days} days
                  </Text>
                </View>
                <Text style={[styles.tripStatus, { color: getStatusColor(trip.status) }]}>
                  {getStatusLabel(trip.status)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <TouchableOpacity style={[styles.actionRow, { borderBottomColor: theme.border }]} onPress={() => router.push('/(tabs)/planner')} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>🤖</Text>
            <Text style={[styles.actionLabel, { color: theme.text }]}>Plan a new trip with AI</Text>
            <Text style={[styles.actionChevron, { color: theme.textTertiary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionRow, { borderBottomColor: theme.border }]} onPress={() => router.push('/(tabs)/group')} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={[styles.actionLabel, { color: theme.text }]}>Create a group trip</Text>
            <Text style={[styles.actionChevron, { color: theme.textTertiary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionRow, { borderBottomColor: theme.border }]} onPress={() => router.push('/(tabs)/vibe')} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>💫</Text>
            <Text style={[styles.actionLabel, { color: theme.text }]}>Discover your vibe</Text>
            <Text style={[styles.actionChevron, { color: theme.textTertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.signOutBtn, { borderColor: theme.accent }]}
          onPress={handleSignOut}
          activeOpacity={0.85}
        >
          <Text style={[styles.signOutText, { color: theme.accent }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.textTertiary }]}>FLOCK v1.0.0 · Made with ❤️</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 34, fontWeight: '800', marginBottom: 20, letterSpacing: -0.5 },
  // Guest
  guestCard: { borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2 },
  avatarEmoji: { fontSize: 36 },
  guestTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  guestDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { borderWidth: 1, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 32, alignItems: 'center', width: '100%' },
  secondaryBtnText: { fontSize: 15, fontWeight: '600' },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  featureIcon: { fontSize: 20, width: 28 },
  featureLabel: { flex: 1, fontSize: 14 },
  // Logged in
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatarFilled: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 28, fontWeight: '800', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 22, fontWeight: '700' },
  profileEmail: { fontSize: 13, marginTop: 2 },
  personaBadge: { marginTop: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
  personaText: { fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', borderRadius: 20, paddingVertical: 20, marginBottom: 28 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 4 },
  statDivider: { width: 1 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionAction: { fontSize: 14, fontWeight: '600' },
  emptyTrips: { borderRadius: 16, padding: 24, alignItems: 'center' },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, marginBottom: 10 },
  emptyAction: { fontSize: 14, fontWeight: '600' },
  tripCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginBottom: 10, gap: 12 },
  tripEmoji: { fontSize: 28 },
  tripInfo: { flex: 1 },
  tripTitle: { fontSize: 15, fontWeight: '600' },
  tripMeta: { fontSize: 12, marginTop: 2 },
  tripStatus: { fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  actionIcon: { fontSize: 20, width: 28 },
  actionLabel: { flex: 1, fontSize: 15 },
  actionChevron: { fontSize: 22 },
  signOutBtn: { borderWidth: 1.5, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginBottom: 20 },
  signOutText: { fontSize: 15, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 12 },
});
