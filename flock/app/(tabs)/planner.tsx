import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Message { role: 'user' | 'assistant'; content: string; id: string }

const STARTER_PROMPTS = [
  '🌸 Plan a romantic 5-day trip to Japan for a couple',
  '👨‍👩‍👧‍👦 7 days in Bali with kids — family friendly',
  '🎉 Friend group trip to Barcelona under $1500 each',
  '🧳 Solo travel to Portugal — budget backpacker',
  '💍 Honeymoon in the Maldives — luxury, 6 nights',
  '🌿 2-week adventure in Costa Rica — nature + hiking',
];

// Dev: local proxy on port 3001. Prod: Vercel serverless function at /api/ai-chat
const AI_ENDPOINT = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3001/ai-chat'
  : '/api/ai-chat';

export default function Planner() {
  const { prompt: initialPrompt } = useLocalSearchParams<{ prompt?: string }>();
  const router = useRouter();
  const { user } = useAuth();
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
    Alert.alert('✅ Trip saved!', 'Find it in your Profile.', [
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
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please check your internet connection and try again.", id: Date.now().toString() }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const renderMsg = ({ item }: { item: Message }) => (
    <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
      {item.role === 'assistant' && <Text style={styles.aiLabel}>🐦 FLOCK</Text>}
      <Text style={[styles.bubbleText, item.role === 'user' && styles.userText]}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>🐦 AI Planner</Text>
            <Text style={styles.headerSub}>
              {user ? 'Powered by Claude · Unlimited' : `Powered by Claude · ${guestLimit - guestCount} free messages left`}
            </Text>
          </View>
          {messages.length > 1 && (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveTrip} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
            </TouchableOpacity>
          )}
        </View>

        {/* Chat or empty state */}
        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Where are you going?</Text>
            <Text style={styles.emptySub}>Tell me your dream trip and I'll build the perfect itinerary</Text>
            <View style={styles.starterGrid}>
              {STARTER_PROMPTS.map((p, i) => (
                <TouchableOpacity key={i} style={styles.starter} onPress={() => sendMessage(p)} activeOpacity={0.8}>
                  <Text style={styles.starterText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderMsg}
            keyExtractor={m => m.id}
            contentContainerStyle={styles.msgList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={loading ? (
              <View style={styles.typing}>
                <Text style={styles.typingLabel}>🐦 FLOCK</Text>
                <ActivityIndicator color="#FF5533" size="small" />
              </View>
            ) : null}
          />
        )}

        {/* Limit warning */}
        {isLimited && (
          <TouchableOpacity style={styles.limitBanner} onPress={() => router.push('/(auth)/login')} activeOpacity={0.85}>
            <Text style={styles.limitText}>🔒 Sign in for unlimited AI planning →</Text>
          </TouchableOpacity>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Describe your dream trip..."
            placeholderTextColor="rgba(237,232,223,0.3)"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            editable={!isLimited}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading || isLimited) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading || isLimited}
            activeOpacity={0.85}
          >
            <Feather name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', surfaceHigh: '#131926', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.07)' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  saveBtn: { backgroundColor: C.coral, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyContainer: { flex: 1, padding: 20 },
  emptyTitle: { fontSize: 26, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.muted, lineHeight: 21, marginBottom: 24 },
  starterGrid: { gap: 10 },
  starter: { backgroundColor: C.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  starterText: { color: C.text, fontSize: 13, lineHeight: 18 },
  msgList: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 14, marginBottom: 12 },
  aiBubble: { backgroundColor: C.surface, alignSelf: 'flex-start', borderWidth: 1, borderColor: C.border },
  userBubble: { backgroundColor: C.coral, alignSelf: 'flex-end' },
  aiLabel: { fontSize: 11, fontWeight: '700', color: C.coral, marginBottom: 6 },
  bubbleText: { fontSize: 14, color: C.text, lineHeight: 21 },
  userText: { color: '#fff' },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, alignSelf: 'flex-start', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  typingLabel: { fontSize: 11, fontWeight: '700', color: C.coral },
  limitBanner: { backgroundColor: 'rgba(255,85,51,0.12)', padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,85,51,0.2)', alignItems: 'center' },
  limitText: { color: C.coral, fontSize: 13, fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: Platform.OS === 'ios' ? 8 : 12, borderTopWidth: 1, borderTopColor: C.border, gap: 10 },
  input: { flex: 1, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 14, borderWidth: 1, borderColor: C.border, maxHeight: 120 },
  sendBtn: { backgroundColor: C.coral, borderRadius: 12, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
