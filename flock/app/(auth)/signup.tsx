import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

export default function Signup() {
  const router = useRouter()

  return (
    <View className="flex-1 bg-dark-bg justify-center p-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-dark-text text-lg">← Back</Text>
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-dark-text mb-2">Create Account</Text>
      <Text className="text-dark-textMuted mb-8">
        Join FLOCK to save trips and travel with your crew
      </Text>

      <TouchableOpacity className="bg-coral w-full py-4 rounded-lg mb-3">
        <Text className="text-white text-center font-semibold">Sign up with Email</Text>
      </TouchableOpacity>

      <TouchableOpacity className="border-2 border-dark-borderBright w-full py-4 rounded-lg">
        <Text className="text-dark-text text-center font-semibold">Continue with Google</Text>
      </TouchableOpacity>
    </View>
  )
}
