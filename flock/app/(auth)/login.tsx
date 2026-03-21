import React from 'react'
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import { useRouter } from 'expo-router'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')

  return (
    <View className="flex-1 bg-dark-bg justify-center p-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-dark-text text-lg">← Back</Text>
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-dark-text mb-2">Sign In</Text>
      <Text className="text-dark-textMuted mb-8">
        Sign in to save trips and plan with your friends
      </Text>

      <View className="mb-6">
        <Text className="text-dark-text mb-2 font-semibold">Email</Text>
        <TextInput
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          className="bg-dark-surface text-dark-text p-4 rounded-lg border border-dark-border"
          placeholderTextColor="#rgba(237,232,223,0.20)"
        />
      </View>

      <TouchableOpacity className="bg-coral w-full py-4 rounded-lg mb-3">
        <Text className="text-white text-center font-semibold">Send Magic Link</Text>
      </TouchableOpacity>

      <TouchableOpacity className="border-2 border-dark-borderBright w-full py-4 rounded-lg mb-8">
        <Text className="text-dark-text text-center font-semibold">Continue with Google</Text>
      </TouchableOpacity>

      <View className="flex-row justify-center">
        <Text className="text-dark-textMuted">Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text className="text-coral font-semibold">Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
