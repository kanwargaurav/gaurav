import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingBottom: 48 }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Theme toggle */}
      <View style={{ alignItems: 'flex-end', paddingTop: 56, paddingRight: 24 }}>
        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            backgroundColor: theme.surfaceSecondary,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={{ fontSize: 14, color: theme.textSecondary, fontWeight: '500' }}>
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 48, paddingHorizontal: 24 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: theme.accentMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          shadowColor: theme.accent,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 8,
        }}>
          <Text style={{ fontSize: 40 }}>🐦</Text>
        </View>
        <Text style={{
          fontSize: 52,
          fontWeight: '800',
          color: theme.text,
          letterSpacing: -2,
          marginBottom: 12,
        }}>
          FLOCK
        </Text>
        <Text style={{
          fontSize: 17,
          color: theme.textSecondary,
          textAlign: 'center',
          lineHeight: 24,
          maxWidth: 280,
        }}>
          Your world. Your flock.{'\n'}Fly together.
        </Text>
      </View>

      {/* Features */}
      <View style={{ paddingHorizontal: 20, gap: 12, marginBottom: 40 }}>
        {[
          { icon: '🧭', title: 'Explore free, no sign-up', desc: 'Browse curated destinations from around the world' },
          { icon: '✨', title: 'AI trip planner', desc: 'Describe your dream trip, get a full itinerary instantly' },
          { icon: '👥', title: 'Group travel, simplified', desc: 'AI finds the perfect destination for everyone' },
        ].map((f, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              backgroundColor: theme.surface,
              borderRadius: 20,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.06,
              shadowRadius: 12,
              elevation: 3,
              borderWidth: isDark ? 1 : 0,
              borderColor: theme.border,
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: theme.accentMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 22 }}>{f.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text, marginBottom: 3 }}>
                {f.title}
              </Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 18 }}>
                {f.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTAs */}
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <TouchableOpacity
          style={{
            backgroundColor: theme.accent,
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            shadowColor: theme.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={() => router.replace('/(tabs)/explore')}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 }}>
            Explore Free →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: theme.border,
          }}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={{ color: theme.text, fontSize: 17, fontWeight: '600' }}>Sign In</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', color: theme.textTertiary, fontSize: 13, marginTop: 4 }}>
          No account required to explore
        </Text>
      </View>
    </ScrollView>
  );
}
