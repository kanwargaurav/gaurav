import { View, Text, SafeAreaView } from 'react-native'

export default function Vibe() {
  return (
    <SafeAreaView className="flex-1 bg-dark-bg justify-center items-center">
      <Text className="text-dark-text text-3xl font-bold mb-2">Vibe DNA</Text>
      <Text className="text-dark-textMuted">Build your travel profile</Text>
    </SafeAreaView>
  )
}
