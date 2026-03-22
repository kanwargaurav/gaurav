import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

type GroupTrip = {
  id: string;
  name: string;
  invite_code: string;
  status: string;
  members: any[];
  created_at: string;
};

export default function Group() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [myGroups, setMyGroups] = useState<GroupTrip[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingGroups(true);
    supabase
      .from('group_trips')
      .select('id, name, invite_code, status, members, created_at')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setMyGroups(data as GroupTrip[]);
        setLoadingGroups(false);
      });
  }, [user]);

  const requireAuth = (action: () => void) => {
    if (!user) {
      Alert.alert('Sign in required', 'Create a free account to plan group trips.', [
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    action();
  };

  const handleCreate = async () => {
    if (!groupName.trim()) { Alert.alert('Enter a group name'); return; }
    setSaving(true);
    const { data, error } = await supabase
      .from('group_trips')
      .insert({ name: groupName.trim(), created_by: user!.id, members: [{ user_id: user!.id, email: user!.email }] })
      .select()
      .single();
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    setShowCreate(false);
    setGroupName('');
    setMyGroups(prev => [data as GroupTrip, ...prev]);
    Alert.alert('Group created!', `Invite code: ${(data as any).invite_code}\n\nShare this with your travel buddies!`);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) { Alert.alert('Enter an invite code'); return; }
    setSaving(true);
    const { data, error } = await supabase
      .from('group_trips')
      .select('*')
      .eq('invite_code', joinCode.trim().toUpperCase())
      .single();
    if (error || !data) {
      setSaving(false);
      Alert.alert('Not found', 'No group found with that invite code. Check and try again.');
      return;
    }
    const group = data as GroupTrip;
    const alreadyMember = group.members?.some((m: any) => m.user_id === user!.id);
    if (!alreadyMember) {
      const updatedMembers = [...(group.members ?? []), { user_id: user!.id, email: user!.email }];
      await supabase.from('group_trips').update({ members: updatedMembers }).eq('id', group.id);
    }
    setSaving(false);
    setShowJoin(false);
    setJoinCode('');
    Alert.alert('Joined!', `You've joined "${group.name}". The group creator will be in touch!`);
  };

  const getStatusColor = (status: string) => {
    if (status === 'collecting') return theme.warning;
    if (status === 'voting') return '#7755F0';
    if (status === 'planning') return theme.success;
    return theme.textSecondary;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'collecting') return '📋 Collecting preferences';
    if (status === 'voting') return '🗳️ Voting in progress';
    if (status === 'planning') return '✈️ Planning trip';
    return status;
  };

  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.25 : 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: isDark ? 1 : 0,
    borderColor: theme.border,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Group Trips</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Travel together, plan together 🐦</Text>

        {user && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>My Groups</Text>
            {loadingGroups ? (
              <ActivityIndicator color={theme.accent} style={{ marginVertical: 20 }} />
            ) : myGroups.length === 0 ? (
              <View style={[styles.emptyGroups, { backgroundColor: theme.surface, ...cardShadow }]}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={[styles.emptyText, { color: theme.text }]}>No group trips yet</Text>
                <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Create one or join with an invite code</Text>
              </View>
            ) : (
              myGroups.map(group => (
                <View key={group.id} style={[styles.groupCard, { backgroundColor: theme.surface, ...cardShadow }]}>
                  <View style={styles.groupCardTop}>
                    <Text style={[styles.groupName, { color: theme.text }]}>{group.name}</Text>
                    <View style={[styles.codeBadge, { backgroundColor: theme.accentMuted }]}>
                      <Text style={[styles.codeText, { color: theme.accent }]}>{group.invite_code}</Text>
                    </View>
                  </View>
                  <Text style={[styles.groupStatus, { color: getStatusColor(group.status) }]}>
                    {getStatusLabel(group.status)}
                  </Text>
                  <Text style={[styles.groupMembers, { color: theme.textSecondary }]}>
                    👥 {group.members?.length ?? 1} member{(group.members?.length ?? 1) !== 1 ? 's' : ''}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>How it works</Text>
          {[
            { icon: '📨', title: 'Invite your group', desc: 'Share a 6-letter code — works on any platform' },
            { icon: '🗳️', title: 'Everyone votes privately', desc: 'Dates, budget, vibes — no peer pressure' },
            { icon: '🤖', title: 'AI finds the perfect match', desc: '3 ranked destinations with group fit scores' },
            { icon: '✈️', title: 'Build the itinerary together', desc: 'Shared planning, real-time updates' },
          ].map((item, i) => (
            <View key={i} style={[styles.stepCard, { backgroundColor: theme.surface, ...cardShadow }]}>
              <View style={[styles.stepIcon, { backgroundColor: theme.accentMuted }]}>
                <Text style={styles.stepEmoji}>{item.icon}</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, {
            backgroundColor: theme.accent,
            shadowColor: theme.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 5,
          }]}
          onPress={() => requireAuth(() => setShowCreate(true))}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>+ Create Group Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: theme.accent }]}
          onPress={() => requireAuth(() => setShowJoin(true))}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryBtnText, { color: theme.accent }]}>Join with Invite Code →</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Create Group Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Create Group Trip</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Give your trip a name, then share the invite code</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. Tokyo 2025 with the crew"
              placeholderTextColor={theme.textTertiary}
              value={groupName}
              onChangeText={setGroupName}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: theme.accent }]}
              onPress={handleCreate}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Create Group</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowCreate(false)}>
              <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Join Group Modal */}
      <Modal visible={showJoin} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Join a Group Trip</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Enter the 6-letter invite code from a friend</Text>
            <TextInput
              style={[styles.modalInput, styles.codeInput, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, color: theme.text }]}
              placeholder="ABCD12"
              placeholderTextColor={theme.textTertiary}
              value={joinCode}
              onChangeText={t => setJoinCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: theme.accent }]}
              onPress={handleJoin}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Join Trip</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowJoin(false)}>
              <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 24 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  emptyGroups: { borderRadius: 20, padding: 28, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  emptySubtext: { fontSize: 13, textAlign: 'center' },
  groupCard: { borderRadius: 16, padding: 16, marginBottom: 10 },
  groupCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  groupName: { fontSize: 16, fontWeight: '700', flex: 1 },
  codeBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  codeText: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  groupStatus: { fontSize: 13, marginBottom: 4 },
  groupMembers: { fontSize: 12 },
  stepCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 16, padding: 16, marginBottom: 10, gap: 14 },
  stepIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stepEmoji: { fontSize: 22 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  stepDesc: { fontSize: 13, lineHeight: 18 },
  primaryBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { borderWidth: 1.5, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  secondaryBtnText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 48, borderTopWidth: 1 },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, marginBottom: 24 },
  modalInput: { borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 15, marginBottom: 16 },
  codeInput: { fontSize: 24, fontWeight: '700', letterSpacing: 4, textAlign: 'center' },
  modalBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalCancel: { alignItems: 'center', paddingVertical: 12 },
  modalCancelText: { fontSize: 15 },
});
