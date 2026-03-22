import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '../lib/supabase';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import PWAInstallBanner from '../components/PWAInstallBanner';
import '../global.css';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const router = useRouter();
  const { isDark } = useTheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // Handle magic link sign-in redirect
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        if (!profile?.username) {
          router.replace('/(auth)/onboarding' as any);
        } else {
          router.replace('/(tabs)/explore');
        }
      } else if (event === 'SIGNED_OUT') {
        router.replace('/(auth)/welcome');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {Platform.OS === 'web' && <PWAInstallBanner />}
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
