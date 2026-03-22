import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

export default function Login() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async () => {
    if (!email) { Alert.alert('Enter your email first'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.EXPO_PUBLIC_APP_URL ?? 'https://doanything.ai'}` },
    });
    setLoading(false);
    if (error) { Alert.alert('Error', error.message); }
    else { Alert.alert('Magic link sent!', 'Check your email and tap the link to sign in.'); }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.textSecondary }]}>← Back</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={[styles.logoContainer, { backgroundColor: theme.accentMuted }]}>
          <Text style={styles.logoEmoji}>🐦</Text>
        </View>

        {/* Heading */}
        <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Sign in with a magic link — no password needed
        </Text>

        {/* Email input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Email address</Text>
          <View style={[styles.inputContainer, {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.15 : 0.04,
            shadowRadius: 6,
            elevation: 2,
          }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="you@example.com"
              placeholderTextColor={theme.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Send magic link button */}
        <TouchableOpacity
          style={[styles.primaryBtn, {
            backgroundColor: theme.accent,
            shadowColor: theme.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 5,
          }]}
          onPress={handleMagicLink}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryBtnText}>Send Magic Link ✉️</Text>}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.textTertiary }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        {/* Sign up link */}
        <View style={styles.signupRow}>
          <Text style={[styles.signupPrompt, { color: theme.textSecondary }]}>New to FLOCK? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={[styles.signupLink, { color: theme.accent }]}>Create account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 56, paddingBottom: 40 },
  backBtn: { marginBottom: 32 },
  backText: { fontSize: 16, fontWeight: '500' },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoEmoji: { fontSize: 32 },
  title: { fontSize: 34, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginBottom: 36, lineHeight: 22 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputContainer: {
    borderRadius: 14,
    borderWidth: 1,
  },
  input: { padding: 16, fontSize: 16 },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 28,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 16, fontSize: 13 },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupPrompt: { fontSize: 15 },
  signupLink: { fontSize: 15, fontWeight: '600' },
});
