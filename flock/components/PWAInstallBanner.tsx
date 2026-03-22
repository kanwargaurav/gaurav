import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

export default function PWAInstallBanner() {
  const { theme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (isInStandaloneMode()) return;
    if (typeof localStorage !== 'undefined' && localStorage.getItem('pwa_dismissed')) return;

    if (isIOS()) {
      setShowIOSBanner(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler as any);
    return () => window.removeEventListener('beforeinstallprompt', handler as any);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('pwa_dismissed', '1');
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIOSBanner(false);
  };

  if (dismissed || (!deferredPrompt && !showIOSBanner)) return null;

  return (
    <View style={[styles.banner, { backgroundColor: theme.surface, borderTopColor: theme.border, shadowColor: '#000' }]}>
      <Text style={{ fontSize: 20 }}>📲</Text>
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>Add FLOCK to Home Screen</Text>
        <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
          {showIOSBanner ? 'Tap Share (⬆️) then "Add to Home Screen"' : 'Install for the best experience'}
        </Text>
      </View>
      {!showIOSBanner && (
        <TouchableOpacity onPress={handleInstall} style={[styles.installBtn, { backgroundColor: theme.accent }]}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Install</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
        <Text style={{ fontSize: 18, color: theme.textTertiary }}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  installBtn: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  closeBtn: { padding: 4, marginLeft: 8 },
});
