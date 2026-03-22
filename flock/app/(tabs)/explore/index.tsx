import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput,
  SafeAreaView, ActivityIndicator, ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useTheme } from '../../../hooks/useTheme';

type Destination = {
  id: string;
  place: string;
  country: string;
  emoji: string;
  description: string;
  days_rec: number;
  budget_usd: number;
  rating: number;
  clone_count: number;
  tags: string[];
  is_featured: boolean;
};

const TAGS = ['All', 'Romance', 'Food', 'Adventure', 'Culture', 'Nature', 'Solo', 'Family', 'Friends', 'Budget', 'Luxury', 'Beach', 'Urban'];

export default function Explore() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('destinations')
      .select('id, place, country, emoji, description, days_rec, budget_usd, rating, clone_count, tags, is_featured')
      .order('clone_count', { ascending: false })
      .then(({ data, error }) => {
        if (data) setDestinations(data as Destination[]);
        if (error) console.warn('Destinations fetch error:', error.message);
        setLoading(false);
      });
  }, []);

  const filtered = destinations.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !search || d.place.toLowerCase().includes(q) || (d.country ?? '').toLowerCase().includes(q);
    const matchTag = !selectedTag || selectedTag === 'All' || (d.tags ?? []).includes(selectedTag);
    return matchSearch && matchTag;
  });

  const renderCard = ({ item }: { item: Destination }) => (
    <TouchableOpacity
      style={[styles.card, {
        backgroundColor: theme.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.06,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: isDark ? 1 : 0,
        borderColor: theme.border,
      }]}
      onPress={() => router.push({ pathname: '/(tabs)/explore/[id]', params: { id: item.id } } as any)}
      activeOpacity={0.8}
    >
      <View style={styles.cardTop}>
        <View style={[styles.emojiContainer, { backgroundColor: theme.accentMuted }]}>
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: theme.text }]}>{item.place}</Text>
          <Text style={[styles.cardCountry, { color: theme.textSecondary }]}>{item.country}</Text>
        </View>
        <View style={[styles.ratingBadge, { backgroundColor: theme.badge }]}>
          <Text style={[styles.ratingText, { color: theme.warning }]}>⭐ {item.rating}</Text>
        </View>
      </View>
      <Text style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>{item.days_rec} days</Text>
          <Text style={[styles.metaDot, { color: theme.textTertiary }]}>·</Text>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>${(item.budget_usd ?? 0).toLocaleString()}</Text>
        </View>
        <View style={[styles.cloneBadge, { backgroundColor: theme.accentMuted }]}>
          <Text style={[styles.cloneText, { color: theme.accent }]}>⚡ {(item.clone_count ?? 0).toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Explore</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Where will your flock fly? 🐦</Text>
      </View>

      {/* Search bar */}
      <View style={[styles.searchRow, {
        backgroundColor: theme.surface,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 8,
        elevation: 2,
      }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search destinations..."
          placeholderTextColor={theme.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tag chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagList}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4, alignItems: 'center' }}
      >
        {TAGS.map(tag => {
          const isActive = selectedTag === tag || (!selectedTag && tag === 'All');
          return (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, {
                backgroundColor: isActive ? theme.accent : theme.surfaceSecondary,
                borderColor: isActive ? theme.accent : theme.border,
              }]}
              onPress={() => setSelectedTag(tag === 'All' ? null : tag)}
            >
              <Text style={[styles.tagText, { color: isActive ? '#fff' : theme.textSecondary }]}>
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading destinations...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🌍</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No destinations match your search</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  searchIcon: { marginRight: 8, fontSize: 14 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 15 },
  tagList: { marginBottom: 16, flexGrow: 0, maxHeight: 52 },
  tag: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 100,
    marginRight: 8,
    borderWidth: 1,
  },
  tagText: { fontSize: 13, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 14 },
  emojiContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 26 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  cardCountry: { fontSize: 13, marginTop: 2 },
  ratingBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  ratingText: { fontSize: 12, fontWeight: '700' },
  cardDesc: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, fontWeight: '500' },
  metaDot: { marginHorizontal: 2 },
  cloneBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  cloneText: { fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15 },
});
