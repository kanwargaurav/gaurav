import { View, Text, SafeAreaView } from 'react-native'

export default function Group() {
  return (
    <SafeAreaView className="flex-1 bg-dark-bg justify-center items-center">
      <Text className="text-dark-text text-3xl font-bold mb-2">Group Trips</Text>
      <Text className="text-dark-textMuted">Travel together, plan together</Text>
    </SafeAreaView>
  )
}
