import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

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
    if (status === 'planning') return '#F5A020';
    if (status === 'booked') return '#7755F0';
    if (status === 'completed') return '#0BBFA0';
    return C.muted;
  };

  // Guest view
  if (!authLoading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Profile</Text>

          <View style={styles.guestCard}>
            <View style={styles.avatar}><Text style={styles.avatarEmoji}>🐦</Text></View>
            <Text style={styles.guestTitle}>You're exploring as a guest</Text>
            <Text style={styles.guestDesc}>Sign in to save trips, track memories, and connect with travellers</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/signup')} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Create Free Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/login')} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>What you unlock</Text>
          {[
            { icon: '✈️', label: 'Save & clone trip itineraries' },
            { icon: '📸', label: 'Capture memories from your trips' },
            { icon: '👥', label: 'Create and join group trips' },
            { icon: '🤖', label: 'Unlimited AI trip planning' },
            { icon: '🌍', label: 'Share your Trip Stories' },
          ].map(f => (
            <View key={f.icon} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={{ color: '#0BBFA0', fontSize: 16 }}>✓</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Loading auth
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}><ActivityIndicator size="large" color="#FF5533" /></View>
      </SafeAreaView>
    );
  }

  // Logged-in view
  const displayName = profile?.full_name ?? profile?.username ?? user?.email?.split('@')[0] ?? 'Traveller';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarFilled}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {profile?.persona && (
              <View style={styles.personaBadge}>
                <Text style={styles.personaText}>🧭 {profile.persona}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{trips.length}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{trips.filter(t => t.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{trips.reduce((s, t) => s + (t.days ?? 0), 0)}</Text>
            <Text style={styles.statLabel}>Days Planned</Text>
          </View>
        </View>

        {/* My Trips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Trips</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.sectionAction}>+ Add trip</Text>
            </TouchableOpacity>
          </View>

          {loadingData ? (
            <ActivityIndicator color="#FF5533" style={{ marginVertical: 20 }} />
          ) : trips.length === 0 ? (
            <View style={styles.emptyTrips}>
              <Text style={styles.emptyEmoji}>✈️</Text>
              <Text style={styles.emptyText}>No trips saved yet</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                <Text style={styles.emptyAction}>Browse destinations →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            trips.map(trip => (
              <View key={trip.id} style={styles.tripCard}>
                <Text style={styles.tripEmoji}>{trip.cover_emoji}</Text>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripTitle}>{trip.title}</Text>
                  <Text style={styles.tripMeta}>{trip.destination} · {trip.days} days</Text>
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
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/(tabs)/planner')} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>🤖</Text>
            <Text style={styles.actionLabel}>Plan a new trip with AI</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/(tabs)/group')} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionLabel}>Create a group trip</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/(tabs)/vibe')} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>💫</Text>
            <Text style={styles.actionLabel}>Discover your vibe</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>FLOCK v1.0.0 · Made with ❤️</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', surfaceHigh: '#131926', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.07)' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: C.text, marginBottom: 20 },
  // Guest
  guestCard: { backgroundColor: C.surface, borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: C.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#131926', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: C.coral },
  avatarEmoji: { fontSize: 36 },
  guestTitle: { fontSize: 20, fontWeight: '700', color: C.text, textAlign: 'center', marginBottom: 8 },
  guestDesc: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  primaryBtn: { backgroundColor: C.coral, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 32, alignItems: 'center', width: '100%', marginBottom: 10 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 32, alignItems: 'center', width: '100%' },
  secondaryBtnText: { color: C.muted, fontSize: 15, fontWeight: '600' },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  featureIcon: { fontSize: 20, width: 28 },
  featureLabel: { flex: 1, fontSize: 14, color: C.text },
  // Logged in
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatarFilled: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.coral, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 28, fontWeight: '800', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 22, fontWeight: '700', color: C.text },
  profileEmail: { fontSize: 13, color: C.muted, marginTop: 2 },
  personaBadge: { marginTop: 6, backgroundColor: 'rgba(255,85,51,0.12)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
  personaText: { color: C.coral, fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 16, paddingVertical: 20, marginBottom: 28, borderWidth: 1, borderColor: C.border },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 11, color: C.muted, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: C.border },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  sectionAction: { color: C.coral, fontSize: 14, fontWeight: '600' },
  emptyTrips: { backgroundColor: C.surface, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: C.muted, fontSize: 14, marginBottom: 10 },
  emptyAction: { color: C.coral, fontSize: 14, fontWeight: '600' },
  tripCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: C.border },
  tripEmoji: { fontSize: 28 },
  tripInfo: { flex: 1 },
  tripTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  tripMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
  tripStatus: { fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  actionIcon: { fontSize: 20, width: 28 },
  actionLabel: { flex: 1, fontSize: 15, color: C.text },
  actionChevron: { color: C.muted, fontSize: 22 },
  signOutBtn: { borderWidth: 1, borderColor: 'rgba(255,85,51,0.3)', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 20 },
  signOutText: { color: C.coral, fontSize: 15, fontWeight: '600' },
  version: { textAlign: 'center', color: C.muted, fontSize: 12 },
});
