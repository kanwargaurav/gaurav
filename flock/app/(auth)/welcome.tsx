import React from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'

export default function Welcome() {
  const router = useRouter()

  return (
    <ScrollView className="flex-1 bg-dark-bg">
      <View className="flex-1 justify-center items-center p-6 pt-20">
        <Text className="text-5xl mb-4">🐦</Text>
        <Text className="text-4xl font-bold text-dark-text text-center mb-2">
          FLOCK
        </Text>
        <Text className="text-lg text-dark-textMuted text-center mb-12">
          Your world. Your flock. Fly together.
        </Text>

        <View className="bg-dark-surface p-8 rounded-2xl mb-8 w-full">
          <Text className="text-dark-text text-lg font-semibold mb-4">
            ✨ Explore destinations
          </Text>
          <Text className="text-dark-textMuted mb-6">
            Browse thousands of public trips from travelers like you
          </Text>

          <Text className="text-dark-text text-lg font-semibold mb-4">
            🤖 Plan with AI
          </Text>
          <Text className="text-dark-textMuted mb-6">
            Our AI planner understands your travel style and builds perfect itineraries
          </Text>

          <Text className="text-dark-text text-lg font-semibold mb-4">
            👥 Travel together
          </Text>
          <Text className="text-dark-textMuted">
            Create group trips and let our AI negotiate the perfect destination for everyone
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/explore')}
          className="bg-coral w-full py-4 rounded-lg mb-3"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Explore Free
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          className="border-2 border-coral w-full py-4 rounded-lg"
        >
          <Text className="text-coral text-center font-semibold text-lg">
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
