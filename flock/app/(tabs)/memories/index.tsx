import { View, Text, SafeAreaView } from 'react-native'

export default function Memories() {
  return (
    <SafeAreaView className="flex-1 bg-dark-bg justify-center items-center">
      <Text className="text-dark-text text-3xl font-bold mb-2">Memories</Text>
      <Text className="text-dark-textMuted">Capture your adventures</Text>
    </SafeAreaView>
  )
}
