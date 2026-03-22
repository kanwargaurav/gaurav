import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, Alert, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface Message { role: 'user' | 'assistant'; content: string; id: string }

const STARTER_PROMPTS = [
  { emoji: '🌸', text: 'Romantic 5-day trip to Japan for a couple' },
  { emoji: '👨‍👩‍👧‍👦', text: '7 days in Bali with kids — family friendly' },
  { emoji: '🎉', text: 'Friend group trip to Barcelona under $1500 each' },
  { emoji: '🧳', text: 'Solo travel to Portugal — budget backpacker' },
  { emoji: '💍', text: 'Honeymoon in the Maldives — luxury, 6 nights' },
  { emoji: '🌿', text: '2-week adventure in Costa Rica — nature + hiking' },
];

// Dev: local proxy on port 3001. Prod: Vercel serverless function at /api/ai-chat
const AI_ENDPOINT = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3001/ai-chat'
  : '/api/ai-chat';

export default function Planner() {
  const { prompt: initialPrompt } = useLocalSearchParams<{ prompt?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const listRef = useRef<FlatList>(null);

  const guestLimit = 5;
  const isLimited = !user && guestCount >= guestLimit;

  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSaveTrip = async () => {
    if (!user) {
      Alert.alert('Sign in to save', 'Create a free account to save this itinerary.', [
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const lastAiMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastUserMsg || !lastAiMsg) return;
    setSaving(true);
    const title = lastUserMsg.content.slice(0, 60).replace(/^[^\w]+/, '');
    await supabase.from('trips').insert({
      user_id: user.id,
      title: title || 'AI Trip Plan',
      cover_emoji: '🤖',
      ai_summary: lastAiMsg.content.slice(0, 500),
      ai_chat_log: messages.map(m => ({ role: m.role, content: m.content })),
      status: 'planning',
    });
    setSaving(false);
    Alert.alert('Trip saved!', 'Find it in your Profile.', [
      { text: 'View Profile', onPress: () => router.push('/(tabs)/profile') },
      { text: 'Keep Planning', style: 'cancel' },
    ]);
  };

  const isEmpty = messages.length === 0;

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    if (isLimited) return;

    const userMsg: Message = { role: 'user', content: text.trim(), id: Date.now().toString() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    setGuestCount(c => c + 1);

    try {
      const body = {
        messages: updated.map(m => ({ role: m.role, content: m.content })),
        persona: 'traveler',
      };

      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`API error ${response.status}`);

      const data = await response.json();
      const aiContent = data.content || data.message || 'Sorry, something went wrong. Try again.';
      const aiMsg: Message = { role: 'assistant', content: aiContent, id: (Date.now() + 1).toString() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your internet connection and try again.",
        id: Date.now().toString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const renderMsg = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[
        styles.bubble,
        isUser ? [styles.userBubble, { backgroundColor: theme.accent }]
          : [styles.aiBubble, {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.2 : 0.05,
            shadowRadius: 6,
            elevation: 2,
          }],
      ]}>
        {!isUser && (
          <Text style={[styles.aiLabel, { color: theme.accent }]}>🐦 FLOCK</Text>
        )}
        <Text style={[styles.bubbleText, { color: isUser ? '#fff' : theme.text }]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>AI Planner</Text>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
              {user
                ? 'Powered by Claude · Unlimited'
                : `Powered by Claude · ${guestLimit - guestCount} free messages left`}
            </Text>
          </View>
          {messages.length > 1 && (
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.accent }]}
              onPress={handleSaveTrip}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.saveBtnText}>Save</Text>}
            </TouchableOpacity>
          )}
        </View>

        {/* Chat or empty state */}
        {isEmpty ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.emptyContainer, { paddingHorizontal: 20, paddingTop: 28 }]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Where are you going?</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Tell me your dream trip and I'll build the perfect itinerary
            </Text>

            {/* Starter prompts grid */}
            <View style={styles.starterGrid}>
              {STARTER_PROMPTS.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.starter, {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDark ? 0.15 : 0.04,
                    shadowRadius: 6,
                    elevation: 2,
                  }]}
                  onPress={() => sendMessage(`${p.emoji} ${p.text}`)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.starterEmoji}>{p.emoji}</Text>
                  <Text style={[styles.starterText, { color: theme.text }]}>{p.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderMsg}
            keyExtractor={m => m.id}
            contentContainerStyle={styles.msgList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={loading ? (
              <View style={[styles.typing, {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }]}>
                <Text style={[styles.typingLabel, { color: theme.accent }]}>🐦 FLOCK</Text>
                <ActivityIndicator color={theme.accent} size="small" />
              </View>
            ) : null}
          />
        )}

        {/* Limit warning */}
        {isLimited && (
          <TouchableOpacity
            style={[styles.limitBanner, { backgroundColor: theme.accentMuted }]}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={[styles.limitText, { color: theme.accent }]}>
              🔒 Sign in for unlimited AI planning →
            </Text>
          </TouchableOpacity>
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, {
          borderTopColor: theme.border,
          backgroundColor: theme.bg,
        }]}>
          <View style={[styles.inputWrapper, {
            backgroundColor: theme.surfaceSecondary,
            borderColor: theme.border,
          }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Describe your dream trip..."
              placeholderTextColor={theme.textTertiary}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              editable={!isLimited}
            />
            <TouchableOpacity
              style={[styles.sendBtn, {
                backgroundColor: theme.accent,
                opacity: (!input.trim() || loading || isLimited) ? 0.4 : 1,
              }]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading || isLimited}
              activeOpacity={0.85}
            >
              <Feather name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  headerSub: { fontSize: 12, marginTop: 2 },
  saveBtn: { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 9 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyContainer: { paddingBottom: 24 },
  emptyTitle: { fontSize: 28, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
  emptySub: { fontSize: 15, lineHeight: 22, marginBottom: 28 },
  starterGrid: { gap: 10 },
  starter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  starterEmoji: { fontSize: 22, width: 30 },
  starterText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  msgList: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '85%', borderRadius: 18, padding: 14, marginBottom: 12 },
  aiBubble: { alignSelf: 'flex-start', borderWidth: 1 },
  userBubble: { alignSelf: 'flex-end' },
  aiLabel: { fontSize: 11, fontWeight: '700', marginBottom: 6 },
  bubbleText: { fontSize: 14, lineHeight: 22 },
  typing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  typingLabel: { fontSize: 11, fontWeight: '700' },
  limitBanner: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,85,51,0.2)',
    alignItems: 'center',
  },
  limitText: { fontSize: 13, fontWeight: '600' },
  inputBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 8 : 10,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  input: { flex: 1, fontSize: 15, maxHeight: 120, paddingVertical: 6 },
  sendBtn: {
    borderRadius: 16,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
});
