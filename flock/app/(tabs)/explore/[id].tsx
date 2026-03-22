import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
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
  persona_tag: string;
  is_featured: boolean;
};

const PERSONA_TIPS: Record<string, string[]> = {
  couple: ['Book restaurants 2+ weeks ahead', 'Ask for romantic seating or sunset views', 'Avoid peak tourist hours — go early or late'],
  family: ['Check stroller/wheelchair access at attractions', "Look for family menus and kids' discounts", 'Build in nap/rest time each afternoon', 'Book skip-the-line tickets to avoid long waits with kids'],
  solo: ['Stay in social hostels or co-living spaces', 'Join free walking tours to meet people', 'Notify someone of your daily itinerary'],
  friends: ['Use Splitwise or Tricount for shared expenses', 'Book group tables at least 1 week ahead', 'Agree on a daily spend cap before you go'],
  default: ['Download offline maps before arriving', 'Get a local SIM card at the airport', 'Book top attractions skip-the-line in advance'],
};

export default function DestinationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [dest, setDest] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);

  const shadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.25 : 0.07,
    shadowRadius: 12,
    elevation: 3,
  };

  useEffect(() => {
    if (!id) return;
    supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (data) setDest(data as Destination);
        if (error) console.warn(error.message);
        setLoading(false);
      });
  }, [id]);

  const handlePlanWithAI = () => {
    router.push({
      pathname: '/(tabs)/planner',
      params: { prompt: `Plan a ${dest?.days_rec}-day family trip to ${dest?.place}, ${dest?.country} for a family of 4 flying from RDU (Raleigh-Durham, NC). Include kid-friendly activities and restaurant recommendations.` },
    } as any);
  };

  const handleClone = async () => {
    if (!user) {
      Alert.alert('Sign in to clone', 'Create a free account to save and customise this itinerary.', [
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (!dest) return;
    setCloning(true);
    const { error } = await supabase.from('trips').insert({
      user_id: user.id,
      title: `My ${dest.place} Trip`,
      destination: dest.place,
      dest_id: dest.id,
      cover_emoji: dest.emoji,
      days: dest.days_rec,
      budget_usd: dest.budget_usd,
      tags: dest.tags,
      persona: dest.persona_tag,
      status: 'planning',
    });
    setCloning(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('✅ Trip cloned!', `${dest.place} has been added to your trips.`, [
        { text: 'View Profile', onPress: () => router.push('/(tabs)/profile') },
        { text: 'Keep Exploring', style: 'cancel' },
      ]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </SafeAreaView>
    );
  }

  if (!dest) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 20 }}>
          <Text style={{ color: theme.accent, fontSize: 16, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🗺️</Text>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>Destination not found</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 8 }}>Try exploring other destinations</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tips = PERSONA_TIPS[dest.persona_tag ?? 'default'] ?? PERSONA_TIPS.default;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
          <Text style={{ color: theme.accent, fontSize: 16, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24 }}>
          <View style={[{
            width: 100, height: 100, borderRadius: 28, backgroundColor: theme.accentMuted,
            alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }, shadow]}>
            <Text style={{ fontSize: 54 }}>{dest.emoji}</Text>
          </View>
          <Text style={{ fontSize: 34, fontWeight: '800', color: theme.text, textAlign: 'center', letterSpacing: -0.5 }}>
            {dest.place}
          </Text>
          <Text style={{ fontSize: 16, color: theme.textSecondary, marginTop: 4 }}>{dest.country}</Text>
          {dest.is_featured && (
            <View style={{ marginTop: 12, backgroundColor: 'rgba(245,160,32,0.12)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
              <Text style={{ color: '#D4880A', fontSize: 13, fontWeight: '600' }}>⭐ Featured Destination</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={[{
          flexDirection: 'row', marginHorizontal: 20, borderRadius: 18,
          backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
          overflow: 'hidden',
        }, shadow]}>
          {[
            { val: `${dest.days_rec}`, label: 'Days' },
            { val: `$${(dest.budget_usd / 1000).toFixed(1)}k`, label: 'Budget' },
            { val: `⭐ ${dest.rating}`, label: 'Rating' },
            { val: `⚡${(dest.clone_count / 1000).toFixed(1)}k`, label: 'Cloned' },
          ].map((s, i, arr) => (
            <View key={s.label} style={{
              flex: 1, alignItems: 'center', paddingVertical: 16,
              borderRightWidth: i < arr.length - 1 ? 1 : 0,
              borderRightColor: theme.border,
            }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{s.val}</Text>
              <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 3 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>

          {/* About */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 10 }}>About</Text>
            <Text style={{ fontSize: 15, color: theme.textSecondary, lineHeight: 24 }}>{dest.description}</Text>
          </View>

          {/* Vibe Tags */}
          {dest.tags?.length > 0 && (
            <View style={{ marginBottom: 28 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 10 }}>Vibe Tags</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {dest.tags.map(tag => (
                  <View key={tag} style={{ backgroundColor: theme.accentMuted, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 }}>
                    <Text style={{ color: theme.accentText, fontSize: 13, fontWeight: '600' }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* AI CTA */}
          <View style={[{
            borderRadius: 20, padding: 24, marginBottom: 28, alignItems: 'center',
            backgroundColor: theme.accent,
          }, { shadowColor: theme.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }]}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>✨</Text>
            <Text style={{ fontSize: 19, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 }}>
              Get your personalised itinerary
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20, marginBottom: 18 }}>
              Tell FLOCK who you're travelling with and your budget — get a full day-by-day plan with real restaurants, hotels, and hidden gems.
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 }}
              onPress={handlePlanWithAI}
              activeOpacity={0.85}
            >
              <Text style={{ color: theme.accent, fontWeight: '800', fontSize: 15 }}>Plan {dest.place} with AI →</Text>
            </TouchableOpacity>
          </View>

          {/* Practical Tips */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 12 }}>Practical Tips</Text>
            {tips.map((tip, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.accent, marginTop: 9 }} />
                <Text style={{ flex: 1, color: theme.textSecondary, fontSize: 14, lineHeight: 22 }}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Budget Breakdown */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 12 }}>Estimated Budget</Text>
            <View style={[{ backgroundColor: theme.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }, shadow]}>
              {[
                { label: 'Flights (return)', val: `$${Math.round(dest.budget_usd * 0.4).toLocaleString()}` },
                { label: `Hotels (${dest.days_rec} nights)`, val: `$${Math.round(dest.budget_usd * 0.35).toLocaleString()}` },
                { label: 'Food & activities', val: `$${Math.round(dest.budget_usd * 0.25).toLocaleString()}` },
              ].map(row => (
                <View key={row.label} style={{
                  flexDirection: 'row', justifyContent: 'space-between',
                  paddingHorizontal: 18, paddingVertical: 14,
                  borderBottomWidth: 1, borderBottomColor: theme.border,
                }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{row.label}</Text>
                  <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{row.val}</Text>
                </View>
              ))}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 16 }}>
                <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700' }}>Total estimate</Text>
                <Text style={{ color: theme.accent, fontSize: 16, fontWeight: '800' }}>${dest.budget_usd.toLocaleString()}</Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 32,
        backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 12,
      }}>
        <TouchableOpacity
          style={{ flex: 1, borderWidth: 1.5, borderColor: theme.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}
          onPress={handlePlanWithAI}
          activeOpacity={0.85}
        >
          <Text style={{ color: theme.accent, fontWeight: '700', fontSize: 15 }}>✨ Plan with AI</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[{
            flex: 2, backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
          }, { shadowColor: theme.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 }]}
          onPress={handleClone}
          disabled={cloning}
          activeOpacity={0.85}
        >
          {cloning
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>⚡ Clone This Trip</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
