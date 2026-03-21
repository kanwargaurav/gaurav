import { View, Text, SafeAreaView } from 'react-native'

export default function Profile() {
  return (
    <SafeAreaView className="flex-1 bg-dark-bg justify-center items-center">
      <Text className="text-dark-text text-3xl font-bold mb-2">Profile</Text>
      <Text className="text-dark-textMuted">Your travel identity</Text>
    </SafeAreaView>
  )
}
