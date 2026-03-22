import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async () => {
    if (!email) { Alert.alert('Enter your email first'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${process.env.EXPO_PUBLIC_APP_URL ?? 'https://doanything.ai'}` } });
    setLoading(false);
    if (error) { Alert.alert('Error', error.message); }
    else { Alert.alert('✅ Magic link sent!', 'Check your email and tap the link to sign in.'); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in with a magic link — no password needed</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="rgba(237,232,223,0.25)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleMagicLink} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send Magic Link ✉️</Text>}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.signupRow}>
        <Text style={styles.signupPrompt}>New to FLOCK? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.signupLink}>Create account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const C = { bg: '#07090F', surface: '#0E1219', text: '#EDE8DF', muted: 'rgba(237,232,223,0.5)', coral: '#FF5533', border: 'rgba(255,255,255,0.12)' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 32 },
  backText: { color: C.muted, fontSize: 16 },
  title: { fontSize: 32, fontWeight: '700', color: C.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: C.muted, marginBottom: 40, lineHeight: 22 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  input: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 16, fontSize: 15, color: C.text },
  primaryBtn: { backgroundColor: C.coral, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 24 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { color: C.muted, marginHorizontal: 16, fontSize: 13 },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupPrompt: { color: C.muted, fontSize: 15 },
  signupLink: { color: C.coral, fontSize: 15, fontWeight: '600' },
});
