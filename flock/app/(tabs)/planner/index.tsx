import { View, Text, SafeAreaView } from 'react-native'

export default function Planner() {
  return (
    <SafeAreaView className="flex-1 bg-dark-bg justify-center items-center">
      <Text className="text-dark-text text-3xl font-bold mb-2">AI Planner</Text>
      <Text className="text-dark-textMuted">Chat-based trip planning coming soon</Text>
    </SafeAreaView>
  )
}
