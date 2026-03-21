import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

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
    Alert.alert('🎉 Group created!', `Invite code: ${(data as any).invite_code}\n\nShare this with your travel buddies!`);
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
    Alert.alert('✅ Joined!', `You've joined "${group.name}". The group creator will be in touch!`);
  };

  const getStatusColor = (status: string) => {
    if (status === 'collecting') return '#F5A020';
    if (status === 'voting') return '#7755F0';
    if (status === 'planning') return '#0BBFA0';
    return C.muted;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'collecting') return '📋 Collecting preferences';
    if (status === 'voting') return '🗳️ Voting in progress';
    if (status === 'planning') return '✈️ Planning trip';
    return status;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Group Trips</Text>
        <Text style={styles.subtitle}>Travel together, plan together 🐦</Text>

        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Groups</Text>
            {loadingGroups ? (
              <ActivityIndicator color="#FF5533" style={{ marginVertical: 20 }} />
            ) : myGroups.length === 0 ? (
              <View style={styles.emptyGroups}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={styles.emptyText}>No group trips yet</Text>
                <Text style={styles.emptySubtext}>Create one or join with an invite code</Text>
              </View>
            ) : (
              myGroups.map(group => (
                <View key={group.id} style={styles.groupCard}>
                  <View style={styles.groupCardTop}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeText}>{group.invite_code}</Text>
                    </View>
                  </View>
                  <Text style={[styles.groupStatus, { color: getStatusColor(group.status) }]}>
                    {getStatusLabel(group.status)}
                  </Text>
                  <Text style={styles.groupMembers}>
                    👥 {group.members?.length ?? 1} member{(group.members?.length ?? 1) !== 1 ? 's' : ''}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          {[
            { icon: '📨', title: 'Invite your group', desc: 'Share a 6-letter code — works on any platform' },
            { icon: '🗳️', title: 'Everyone votes privately', desc: 'Dates, budget, vibes — no peer pressure' },
            { icon: '🤖', title: 'AI finds the perfect match', desc: '3 ranked destinations with group fit scores' },
            { icon: '✈️', title: 'Build the itinerary together', desc: 'Shared planning, real-time updates' },
          ].map((item, i) => (
            <View key={i} style={styles.stepCard}>
              <View style={styles.stepIcon}><Text style={styles.stepEmoji}>{item.icon}</Text></View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => requireAuth(() => setShowCreate(true))} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>+ Create Group Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => requireAuth(() => setShowJoin(true))} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Join with Invite Code →</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create Group Trip</Text>
            <Text style={styles.modalSubtitle}>Give your trip a name, then share the invite code</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Tokyo 2025 with the crew"
              placeholderTextColor="rgba(237,232,223,0.25)"
              value={groupName}
              onChangeText={setGroupName}
              autoFocus
            />
            <TouchableOpacity style={styles.modalBtn} onPress={handleCreate} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Create Group</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowCreate(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showJoin} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Join a Group Trip</Text>
            <Text style={styles.modalSubtitle}>Enter the 6-letter invite code from a friend</Text>
            <TextInput
              style={[styles.modalInput, styles.codeInput]}
              placeholder="ABCD12"
              placeholderTextColor="rgba(237,232,223,0.25)"
              value={joinCode}
              onChangeText={t => setJoinCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
            <TouchableOpacity style={styles.modalBtn} onPress={handleJoin} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Join Trip</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowJoin(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.07)' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 14, color: C.muted, marginTop: 4, marginBottom: 24 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 14 },
  emptyGroups: { backgroundColor: C.surface, borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 16, fontWeight: '600', color: C.text, marginBottom: 4 },
  emptySubtext: { fontSize: 13, color: C.muted, textAlign: 'center' },
  groupCard: { backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  groupCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  groupName: { fontSize: 16, fontWeight: '700', color: C.text, flex: 1 },
  codeBadge: { backgroundColor: 'rgba(255,85,51,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  codeText: { color: C.coral, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  groupStatus: { fontSize: 13, marginBottom: 4 },
  groupMembers: { fontSize: 12, color: C.muted },
  stepCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10, gap: 14, borderWidth: 1, borderColor: C.border },
  stepIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,85,51,0.12)', alignItems: 'center', justifyContent: 'center' },
  stepEmoji: { fontSize: 22 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  stepDesc: { fontSize: 13, color: C.muted, lineHeight: 18 },
  primaryBtn: { backgroundColor: C.coral, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { borderWidth: 1.5, borderColor: C.coral, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  secondaryBtnText: { color: C.coral, fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0E1219', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 48, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: C.muted, marginBottom: 24 },
  modalInput: { backgroundColor: '#131926', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, fontSize: 15, color: C.text, marginBottom: 16 },
  codeInput: { fontSize: 24, fontWeight: '700', letterSpacing: 4, textAlign: 'center' },
  modalBtn: { backgroundColor: C.coral, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalCancel: { alignItems: 'center', paddingVertical: 12 },
  modalCancelText: { color: C.muted, fontSize: 15 },
});
