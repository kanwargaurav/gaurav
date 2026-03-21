import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

type Memory = {
  id: string;
  type: string;
  content: string | null;
  caption: string | null;
  location: string | null;
  day_number: number | null;
  is_highlight: boolean;
  taken_at: string;
  trip_id: string;
};

type Trip = {
  id: string;
  title: string;
  cover_emoji: string;
  destination: string;
};

const MEMORY_TYPES = [
  { id: 'note', emoji: '✍️', label: 'Note' },
  { id: 'highlight', emoji: '⭐', label: 'Highlight' },
  { id: 'food', emoji: '🍽️', label: 'Food' },
  { id: 'place', emoji: '📍', label: 'Place' },
];

export default function Memories() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newType, setNewType] = useState('note');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('trips')
      .select('id, title, cover_emoji, destination')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTrips(data as Trip[]);
          setSelectedTrip(data[0] as Trip);
        }
      });
  }, [user]);

  useEffect(() => {
    if (!selectedTrip) return;
    setLoading(true);
    supabase
      .from('memories')
      .select('*')
      .eq('trip_id', selectedTrip.id)
      .order('taken_at', { ascending: false })
      .then(({ data }) => {
        if (data) setMemories(data as Memory[]);
        setLoading(false);
      });
  }, [selectedTrip]);

  const handleAddMemory = async () => {
    if (!newContent.trim() && !newCaption.trim()) {
      Alert.alert('Add some content first');
      return;
    }
    if (!selectedTrip || !user) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('memories')
      .insert({
        trip_id: selectedTrip.id,
        user_id: user.id,
        type: newType,
        content: newContent.trim() || null,
        caption: newCaption.trim() || null,
        location: newLocation.trim() || null,
        is_highlight: newType === 'highlight',
      })
      .select()
      .single();
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    setMemories(prev => [data as Memory, ...prev]);
    setShowAdd(false);
    setNewContent('');
    setNewCaption('');
    setNewLocation('');
    setNewType('note');
  };

  const getTypeEmoji = (type: string) => {
    const t = MEMORY_TYPES.find(m => m.id === type);
    return t?.emoji ?? '📝';
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Guest view
  if (!authLoading && !user) {
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
              <Text style={styles.previewDesc}>Notes, highlights, and moments — all in one place</Text>
            </View>
          </View>

          {[
            { icon: '✍️', title: 'Travel notes', desc: 'Diary entries per day' },
            { icon: '⭐', title: 'Highlights', desc: 'Your best moments, starred' },
            { icon: '📍', title: 'Location pins', desc: 'Remember every place you visited' },
            { icon: '🍽️', title: 'Food memories', desc: 'The meals you never want to forget' },
          ].map(f => (
            <View key={f.icon} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/signup')} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>🔒 Sign in to capture memories</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Logged-in view
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Memories</Text>
        {selectedTrip && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Trip selector */}
      {trips.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tripScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {trips.map(trip => (
            <TouchableOpacity
              key={trip.id}
              style={[styles.tripChip, selectedTrip?.id === trip.id && styles.tripChipActive]}
              onPress={() => setSelectedTrip(trip)}
              activeOpacity={0.8}
            >
              <Text style={styles.tripChipEmoji}>{trip.cover_emoji}</Text>
              <Text style={[styles.tripChipText, selectedTrip?.id === trip.id && styles.tripChipTextActive]} numberOfLines={1}>
                {trip.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.memoriesList}>
        {!selectedTrip ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✈️</Text>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptyDesc}>Clone or plan a trip to start capturing memories</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(tabs)/explore')} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Browse Destinations →</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <ActivityIndicator color="#FF5533" style={{ marginTop: 40 }} />
        ) : memories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No memories yet</Text>
            <Text style={styles.emptyDesc}>Tap "+ Add" to capture your first memory from this trip</Text>
          </View>
        ) : (
          memories.map(mem => (
            <View key={mem.id} style={[styles.memoryCard, mem.is_highlight && styles.memoryCardHighlight]}>
              <View style={styles.memoryTop}>
                <Text style={styles.memoryTypeEmoji}>{getTypeEmoji(mem.type)}</Text>
                <View style={styles.memoryMeta}>
                  {mem.location && <Text style={styles.memoryLocation}>📍 {mem.location}</Text>}
                  <Text style={styles.memoryDate}>{formatDate(mem.taken_at)}</Text>
                </View>
                {mem.is_highlight && <Text style={styles.highlightBadge}>⭐</Text>}
              </View>
              {mem.content && <Text style={styles.memoryContent}>{mem.content}</Text>}
              {mem.caption && <Text style={styles.memoryCaption}>{mem.caption}</Text>}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Memory Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Memory</Text>
            {selectedTrip && (
              <Text style={styles.modalTrip}>{selectedTrip.cover_emoji} {selectedTrip.title}</Text>
            )}

            {/* Type selector */}
            <View style={styles.typeRow}>
              {MEMORY_TYPES.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeChip, newType === t.id && styles.typeChipActive]}
                  onPress={() => setNewType(t.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.typeChipEmoji}>{t.emoji}</Text>
                  <Text style={[styles.typeChipLabel, newType === t.id && styles.typeChipLabelActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="What happened? What are you feeling?"
              placeholderTextColor="rgba(237,232,223,0.25)"
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={4}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Caption (optional)"
              placeholderTextColor="rgba(237,232,223,0.25)"
              value={newCaption}
              onChangeText={setNewCaption}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Location (optional)"
              placeholderTextColor="rgba(237,232,223,0.25)"
              value={newLocation}
              onChangeText={setNewLocation}
            />

            <TouchableOpacity style={styles.modalBtn} onPress={handleAddMemory} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Save Memory</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAdd(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', surfaceHigh: '#131926', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.07)', amber: '#F5A020' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 32, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 14, color: C.muted, marginTop: 4, marginBottom: 24 },
  addBtn: { backgroundColor: C.coral, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  tripScroll: { flexGrow: 0, marginBottom: 12 },
  tripChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  tripChipActive: { backgroundColor: C.coral, borderColor: C.coral },
  tripChipEmoji: { fontSize: 16 },
  tripChipText: { color: C.muted, fontSize: 13, fontWeight: '600', maxWidth: 120 },
  tripChipTextActive: { color: '#fff' },
  memoriesList: { paddingHorizontal: 16, paddingBottom: 32 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  memoryCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  memoryCardHighlight: { borderColor: C.amber, backgroundColor: 'rgba(245,160,32,0.06)' },
  memoryTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  memoryTypeEmoji: { fontSize: 22 },
  memoryMeta: { flex: 1 },
  memoryLocation: { fontSize: 12, color: C.muted, marginBottom: 2 },
  memoryDate: { fontSize: 11, color: 'rgba(237,232,223,0.3)' },
  highlightBadge: { fontSize: 18 },
  memoryContent: { fontSize: 15, color: C.text, lineHeight: 22, marginBottom: 6 },
  memoryCaption: { fontSize: 13, color: C.muted, fontStyle: 'italic' },
  // Guest
  previewCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 24, backgroundColor: C.surface },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  previewTile: { width: '33.33%', aspectRatio: 1, backgroundColor: C.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  previewEmoji: { fontSize: 36 },
  previewOverlay: { padding: 20 },
  previewTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 4 },
  previewDesc: { fontSize: 13, color: C.muted },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  featureIcon: { fontSize: 28 },
  featureTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  featureDesc: { fontSize: 12, color: C.muted, marginTop: 2 },
  primaryBtn: { backgroundColor: C.coral, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0E1219', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
  modalTrip: { fontSize: 13, color: C.muted, marginBottom: 20 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: C.surfaceHigh, borderWidth: 1, borderColor: C.border },
  typeChipActive: { backgroundColor: 'rgba(255,85,51,0.15)', borderColor: C.coral },
  typeChipEmoji: { fontSize: 18, marginBottom: 4 },
  typeChipLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  typeChipLabelActive: { color: C.coral },
  modalInput: { backgroundColor: '#131926', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, fontSize: 15, color: C.text, marginBottom: 12 },
  modalTextarea: { minHeight: 100, textAlignVertical: 'top' },
  modalBtn: { backgroundColor: C.coral, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4, marginBottom: 12 },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalCancel: { alignItems: 'center', paddingVertical: 10 },
  modalCancelText: { color: C.muted, fontSize: 15 },
});
