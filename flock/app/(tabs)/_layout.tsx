import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

function TabIcon({ emoji, focused, theme }: { emoji: string; focused: boolean; theme: any }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
      {focused && (
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.accent }} />
      )}
    </View>
  );
}

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 88 : 68,
          ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any : {}),
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="explore/index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🧭" focused={focused} theme={theme} />,
        }}
      />
      {/* Hide the dynamic detail route from tab bar */}
      <Tabs.Screen
        name="explore/[id]"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Plan',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✨" focused={focused} theme={theme} />,
        }}
      />
      <Tabs.Screen
        name="vibe"
        options={{
          title: 'Vibe',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💫" focused={focused} theme={theme} />,
        }}
      />
      <Tabs.Screen
        name="group"
        options={{
          title: 'Group',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} theme={theme} />,
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Memories',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📸" focused={focused} theme={theme} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🐦" focused={focused} theme={theme} />,
        }}
      />
    </Tabs>
  );
}
