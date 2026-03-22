import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

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
  { id: 'note', emoji: '✍️', label: 'Note', accentColor: '#6E6E73' },
  { id: 'highlight', emoji: '⭐', label: 'Highlight', accentColor: '#FF9F0A' },
  { id: 'food', emoji: '🍽️', label: 'Food', accentColor: '#34C759' },
  { id: 'place', emoji: '📍', label: 'Place', accentColor: '#0BAADF' },
];

const TYPE_ACCENT: Record<string, string> = {
  highlight: '#FF9F0A',
  place: '#0BAADF',
  food: '#34C759',
  note: '#8E8E93',
};

export default function Memories() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { theme, isDark } = useTheme();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
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
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
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
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.25 : 0.06,
    shadowRadius: 10,
    elevation: 3,
  };

  const filteredMemories = filterType
    ? memories.filter(m => m.type === filterType)
    : memories;

  // ─── Guest View ───────────────────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <ScrollView contentContainerStyle={styles.guestContent} showsVerticalScrollIndicator={false}>
          {/* Empty state */}
          <View style={styles.emptyHero}>
            <Text style={styles.emptyHeroEmoji}>📸</Text>
            <Text style={[styles.emptyHeroTitle, { color: theme.text }]}>No memories yet</Text>
            <Text style={[styles.emptyHeroSub, { color: theme.textSecondary }]}>
              Save your trips to start capturing moments
            </Text>
          </View>

          {/* Feature preview */}
          <View
            style={[
              styles.previewCard,
              { backgroundColor: theme.surface, borderColor: theme.border, ...cardShadow },
            ]}
          >
            <View style={styles.previewGrid}>
              {['🗼', '🏝️', '🏯', '🌅', '🦁', '🌮'].map((e, i) => (
                <View
                  key={i}
                  style={[styles.previewTile, { backgroundColor: theme.surfaceSecondary }]}
                >
                  <Text style={styles.previewEmoji}>{e}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.previewOverlay, { borderTopColor: theme.border }]}>
              <Text style={[styles.previewTitle, { color: theme.text }]}>
                Your travel memories
              </Text>
              <Text style={[styles.previewDesc, { color: theme.textSecondary }]}>
                Notes, highlights, and moments — all in one place
              </Text>
            </View>
          </View>

          {[
            { icon: '✍️', title: 'Travel notes', desc: 'Diary entries per day', color: '#8E8E93' },
            { icon: '⭐', title: 'Highlights', desc: 'Your best moments, starred', color: '#FF9F0A' },
            { icon: '📍', title: 'Location pins', desc: 'Remember every place you visited', color: '#0BAADF' },
            { icon: '🍽️', title: 'Food memories', desc: 'The meals you never want to forget', color: '#34C759' },
          ].map(f => (
            <View
              key={f.icon}
              style={[
                styles.featureRow,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderLeftColor: f.color,
                  ...cardShadow,
                },
              ]}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: f.color + '18' }]}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>{f.title}</Text>
                <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{f.desc}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              {
                backgroundColor: theme.accent,
                shadowColor: theme.accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 5,
              },
            ]}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Start Planning</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Logged-in View ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Memories</Text>
        {selectedTrip && (
          <TouchableOpacity
            style={[
              styles.addBtn,
              {
                backgroundColor: theme.accent,
                shadowColor: theme.accent,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              },
            ]}
            onPress={() => setShowAdd(true)}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Trip Selector Chips */}
      {trips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tripScroll}
          contentContainerStyle={styles.tripScrollContent}
        >
          {trips.map(trip => {
            const selected = selectedTrip?.id === trip.id;
            return (
              <TouchableOpacity
                key={trip.id}
                style={[
                  styles.tripChip,
                  {
                    backgroundColor: selected ? theme.accent : theme.surface,
                    borderColor: selected ? theme.accent : theme.border,
                    ...cardShadow,
                  },
                ]}
                onPress={() => {
                  setSelectedTrip(trip);
                  setFilterType(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.tripChipEmoji}>{trip.cover_emoji}</Text>
                <Text
                  style={[
                    styles.tripChipText,
                    { color: selected ? '#fff' : theme.text },
                  ]}
                  numberOfLines={1}
                >
                  {trip.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Memory Type Filter */}
      {selectedTrip && memories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: filterType === null ? theme.surfaceSecondary : 'transparent',
                borderColor: filterType === null ? theme.borderStrong : theme.border,
              },
            ]}
            onPress={() => setFilterType(null)}
          >
            <Text style={[styles.filterChipText, { color: filterType === null ? theme.text : theme.textSecondary }]}>
              All
            </Text>
          </TouchableOpacity>
          {MEMORY_TYPES.map(t => {
            const active = filterType === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? t.accentColor + '18' : 'transparent',
                    borderColor: active ? t.accentColor : theme.border,
                  },
                ]}
                onPress={() => setFilterType(active ? null : t.id)}
              >
                <Text style={styles.filterChipEmoji}>{t.emoji}</Text>
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? t.accentColor : theme.textSecondary },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Memory List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.memoriesList}
      >
        {!selectedTrip ? (
          // No trips at all
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📸</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No memories yet</Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              Save your trips to start capturing moments
            </Text>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: theme.accent,
                  shadowColor: theme.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 5,
                },
              ]}
              onPress={() => router.push('/(tabs)/planner' as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Start Planning</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 48 }} />
        ) : memories.length === 0 ? (
          // Trip selected but no memories
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✍️</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No memories yet</Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              Tap "+ Add" to capture your first memory from this trip
            </Text>
            <TouchableOpacity
              style={[
                styles.addFirstMemoryBtn,
                { backgroundColor: theme.accentMuted, borderColor: theme.accent },
              ]}
              onPress={() => setShowAdd(true)}
              activeOpacity={0.85}
            >
              <Text style={[styles.addFirstMemoryText, { color: theme.accent }]}>
                ✍️ Add your first memory
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredMemories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              No memories of this type yet.
            </Text>
          </View>
        ) : (
          // Timeline
          filteredMemories.map((mem, idx) => {
            const accentColor = TYPE_ACCENT[mem.type] ?? '#8E8E93';
            return (
              <View key={mem.id} style={styles.timelineRow}>
                {/* Left accent bar */}
                <View style={[styles.timelineBar, { backgroundColor: accentColor }]} />

                {/* Card */}
                <View
                  style={[
                    styles.memoryCard,
                    {
                      backgroundColor: mem.is_highlight
                        ? isDark
                          ? 'rgba(255,159,10,0.08)'
                          : '#FFFBF0'
                        : theme.surface,
                      borderColor: theme.border,
                      ...cardShadow,
                    },
                  ]}
                >
                  {/* Top row */}
                  <View style={styles.memoryTop}>
                    <View
                      style={[
                        styles.memoryIconWrap,
                        { backgroundColor: accentColor + '18' },
                      ]}
                    >
                      <Text style={styles.memoryTypeEmoji}>{getTypeEmoji(mem.type)}</Text>
                    </View>

                    <View style={styles.memoryMeta}>
                      <Text style={[styles.memoryDate, { color: theme.textTertiary }]}>
                        {formatDate(mem.taken_at)}
                      </Text>
                      {mem.day_number != null && (
                        <View
                          style={[
                            styles.dayBadge,
                            { backgroundColor: theme.surfaceSecondary },
                          ]}
                        >
                          <Text style={[styles.dayBadgeText, { color: theme.textSecondary }]}>
                            Day {mem.day_number}
                          </Text>
                        </View>
                      )}
                    </View>

                    {mem.is_highlight && (
                      <View
                        style={[
                          styles.highlightBadge,
                          { backgroundColor: '#FF9F0A18' },
                        ]}
                      >
                        <Text style={styles.highlightStar}>⭐</Text>
                      </View>
                    )}
                  </View>

                  {/* Content */}
                  {mem.content ? (
                    <Text style={[styles.memoryContent, { color: theme.text }]}>
                      {mem.content}
                    </Text>
                  ) : null}
                  {mem.caption ? (
                    <Text style={[styles.memoryCaption, { color: theme.textSecondary }]}>
                      {mem.caption}
                    </Text>
                  ) : null}

                  {/* Location chip */}
                  {mem.location ? (
                    <View
                      style={[
                        styles.locationChip,
                        { backgroundColor: theme.surfaceSecondary },
                      ]}
                    >
                      <Text style={styles.locationPin}>📍</Text>
                      <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                        {mem.location}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Memory Bottom Sheet Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modal,
              {
                backgroundColor: theme.surface,
                borderTopColor: theme.border,
              },
            ]}
          >
            {/* Handle bar */}
            <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />

            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Memory</Text>
            {selectedTrip && (
              <Text style={[styles.modalTrip, { color: theme.textSecondary }]}>
                {selectedTrip.cover_emoji} {selectedTrip.title}
              </Text>
            )}

            {/* Type selector */}
            <View style={styles.typeRow}>
              {MEMORY_TYPES.map(t => {
                const active = newType === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: active ? t.accentColor + '18' : theme.surfaceSecondary,
                        borderColor: active ? t.accentColor : theme.border,
                      },
                    ]}
                    onPress={() => setNewType(t.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.typeChipEmoji}>{t.emoji}</Text>
                    <Text
                      style={[
                        styles.typeChipLabel,
                        { color: active ? t.accentColor : theme.textSecondary },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Input fields */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Content</Text>
            <TextInput
              style={[
                styles.modalInput,
                styles.modalTextarea,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="What happened? What are you feeling?"
              placeholderTextColor={theme.textTertiary}
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={4}
              autoFocus
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Caption{' '}
              <Text style={[styles.inputLabelOptional, { color: theme.textTertiary }]}>
                (optional)
              </Text>
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Short caption"
              placeholderTextColor={theme.textTertiary}
              value={newCaption}
              onChangeText={setNewCaption}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Location{' '}
              <Text style={[styles.inputLabelOptional, { color: theme.textTertiary }]}>
                (optional)
              </Text>
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="e.g. Eiffel Tower, Paris"
              placeholderTextColor={theme.textTertiary}
              value={newLocation}
              onChangeText={setNewLocation}
            />

            <TouchableOpacity
              style={[
                styles.modalBtn,
                {
                  backgroundColor: theme.accent,
                  shadowColor: theme.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
              onPress={handleAddMemory}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>Save Memory</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAdd(false)}>
              <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ────────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  addBtn: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // ── Trip Selector ─────────────────────────────────────────────────────────────
  tripScroll: { flexGrow: 0, marginBottom: 4 },
  tripScrollContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  tripChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
  },
  tripChipEmoji: { fontSize: 16 },
  tripChipText: { fontSize: 13, fontWeight: '600', maxWidth: 130 },

  // ── Filter Row ────────────────────────────────────────────────────────────────
  filterScroll: { flexGrow: 0, marginTop: 8, marginBottom: 4 },
  filterScrollContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
  },
  filterChipEmoji: { fontSize: 13 },
  filterChipText: { fontSize: 12, fontWeight: '600' },

  // ── Memory List ───────────────────────────────────────────────────────────────
  memoriesList: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },

  // ── Timeline Card ─────────────────────────────────────────────────────────────
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
    gap: 10,
  },
  timelineBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 60,
    flexShrink: 0,
  },
  memoryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  memoryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  memoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  memoryTypeEmoji: { fontSize: 18 },
  memoryMeta: { flex: 1, gap: 3 },
  memoryDate: { fontSize: 11 },
  dayBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  dayBadgeText: { fontSize: 10, fontWeight: '700' },
  highlightBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  highlightStar: { fontSize: 14 },
  memoryContent: { fontSize: 14, lineHeight: 21, marginBottom: 6 },
  memoryCaption: { fontSize: 12, fontStyle: 'italic', marginBottom: 8 },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 2,
  },
  locationPin: { fontSize: 11 },
  locationText: { fontSize: 11, fontWeight: '500' },

  // ── Empty States ──────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  addFirstMemoryBtn: {
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  addFirstMemoryText: { fontSize: 15, fontWeight: '700' },

  // ── Guest View ────────────────────────────────────────────────────────────────
  guestContent: { padding: 20, paddingBottom: 48 },
  emptyHero: { alignItems: 'center', paddingTop: 32, paddingBottom: 28 },
  emptyHeroEmoji: { fontSize: 72, marginBottom: 16 },
  emptyHeroTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8, letterSpacing: -0.3 },
  emptyHeroSub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },

  previewCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 24, borderWidth: 1 },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  previewTile: {
    width: '33.33%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmoji: { fontSize: 38 },
  previewOverlay: { padding: 20, borderTopWidth: 1 },
  previewTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  previewDesc: { fontSize: 13, lineHeight: 18 },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureIcon: { fontSize: 22 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '600' },
  featureDesc: { fontSize: 12, marginTop: 2 },

  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // ── Modal ─────────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 52,
    borderTopWidth: 1,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  modalTrip: { fontSize: 13, marginBottom: 20 },

  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  typeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  typeChipEmoji: { fontSize: 18 },
  typeChipLabel: { fontSize: 11, fontWeight: '600' },

  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.2 },
  inputLabelOptional: { fontWeight: '400' },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginBottom: 14,
  },
  modalTextarea: { minHeight: 100, textAlignVertical: 'top' },
  modalBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalCancel: { alignItems: 'center', paddingVertical: 10 },
  modalCancelText: { fontSize: 15 },
});
