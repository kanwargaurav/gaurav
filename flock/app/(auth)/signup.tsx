import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email) { Alert.alert('Enter your email first'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${process.env.EXPO_PUBLIC_APP_URL ?? 'https://doanything.ai'}` } });
    setLoading(false);
    if (error) { Alert.alert('Error', error.message); }
    else { Alert.alert('✅ Check your email!', 'We sent a sign-in link. Tap it to create your FLOCK account.'); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Join FLOCK</Text>
      <Text style={styles.subtitle}>Enter your email and we'll send you a sign-in link — no password ever</Text>

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

      <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create Account ✈️</Text>}
      </TouchableOpacity>

      <View style={styles.loginRow}>
        <Text style={styles.loginPrompt}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginLink}>Sign in</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.terms}>By joining, you agree to FLOCK's Terms of Service and Privacy Policy</Text>
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
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32 },
  loginPrompt: { color: C.muted, fontSize: 15 },
  loginLink: { color: C.coral, fontSize: 15, fontWeight: '600' },
  terms: { color: C.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
