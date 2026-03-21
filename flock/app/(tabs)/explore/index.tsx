import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Destinations, type Destination } from '../../../constants/destinations';

export default function Explore() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const tags = ['All', 'beach', 'mountains', 'city', 'history', 'food', 'adventure', 'wellness', 'luxury', 'budget'];

  const filtered = Destinations.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase());
    const matchTag = !selectedTag || selectedTag === 'All' || d.tags.includes(selectedTag);
    return matchSearch && matchTag;
  });

  const renderCard = ({ item }: { item: Destination }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/(tabs)/explore/[id]', params: { id: item.id } } as any)} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardCountry}>{item.country}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {item.ratingAverage}</Text>
        </View>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.days} days</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>${item.budgetUSD.toLocaleString()}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{item.bestSeason.split(',')[0]}</Text>
        </View>
        <View style={styles.cloneBadge}>
          <Text style={styles.cloneText}>⚡ {item.cloneCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Where will your flock fly? 🐦</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={16} color="rgba(237,232,223,0.4)" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search destinations..."
          placeholderTextColor="rgba(237,232,223,0.3)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tag filter */}
      <FlatList
        data={tags}
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
              {tag === 'All' ? 'All' : tag.charAt(0).toUpperCase() + tag.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Destination grid */}
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
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, color: C.text, fontSize: 15 },
  tagList: { marginBottom: 12 },
  tag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: C.surface, marginRight: 8, borderWidth: 1, borderColor: C.border },
  tagActive: { backgroundColor: C.coral, borderColor: C.coral },
  tagText: { color: C.muted, fontSize: 13, fontWeight: '600' },
  tagTextActive: { color: '#fff' },
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
