import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

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
      style={styles.card}
      onPress={() => router.push({ pathname: '/(tabs)/explore/[id]', params: { id: item.id } } as any)}
      activeOpacity={0.8}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.place}</Text>
          <Text style={styles.cardCountry}>{item.country}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        </View>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.days_rec} days</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>${(item.budget_usd ?? 0).toLocaleString()}</Text>
        </View>
        <View style={styles.cloneBadge}>
          <Text style={styles.cloneText}>⚡ {(item.clone_count ?? 0).toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Where will your flock fly? 🐦</Text>
      </View>

      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search destinations..."
          placeholderTextColor="rgba(237,232,223,0.3)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={TAGS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={t => t}
        style={styles.tagList}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item: tag }) => (
          <TouchableOpacity
            style={[styles.tag, (selectedTag === tag || (!selectedTag && tag === 'All')) && styles.tagActive]}
            onPress={() => setSelectedTag(tag === 'All' ? null : tag)}
          >
            <Text style={[styles.tagText, (selectedTag === tag || (!selectedTag && tag === 'All')) && styles.tagTextActive]}>
              {tag}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5533" />
          <Text style={styles.loadingText}>Loading destinations...</Text>
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
              <Text style={styles.emptyText}>No destinations match your search</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', surfaceHigh: '#131926', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.07)' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: C.text },
  headerSubtitle: { fontSize: 14, color: C.muted, marginTop: 2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14 },
  searchIcon: { marginRight: 8, fontSize: 14 },
  searchInput: { flex: 1, paddingVertical: 12, color: C.text, fontSize: 15 },
  tagList: { marginBottom: 12, flexGrow: 0 },
  tag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: C.surface, marginRight: 8, borderWidth: 1, borderColor: C.border, alignSelf: 'flex-start' },
  tagActive: { backgroundColor: C.coral, borderColor: C.coral },
  tagText: { color: C.muted, fontSize: 13, fontWeight: '600' },
  tagTextActive: { color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: C.muted, fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardEmoji: { fontSize: 36, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: '700', color: C.text },
  cardCountry: { fontSize: 13, color: C.muted, marginTop: 2 },
  ratingBadge: { backgroundColor: C.surfaceHigh, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  ratingText: { fontSize: 12, color: '#F5A020', fontWeight: '600' },
  cardDesc: { fontSize: 13, color: C.muted, lineHeight: 19, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: C.muted },
  metaDot: { color: C.muted, marginHorizontal: 2 },
  cloneBadge: { backgroundColor: 'rgba(255,85,51,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  cloneText: { color: C.coral, fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: C.muted, fontSize: 15 },
});
