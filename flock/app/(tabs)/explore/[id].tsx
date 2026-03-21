import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { DestinationMap } from '../../../constants/destinations'

export default function DestinationDetail() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const destination = DestinationMap[id as string]

  if (!destination) {
    return (
      <SafeAreaView className="flex-1 bg-dark-bg justify-center items-center">
        <Text className="text-dark-text">Destination not found</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-bg">
      <ScrollView>
        <View className="px-4 pt-4 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-dark-text text-lg">← Back</Text>
          </TouchableOpacity>

          <View className="bg-dark-surface rounded-lg p-6 mb-4">
            <Text className="text-6xl text-center mb-4">{destination.emoji}</Text>
            <Text className="text-dark-text text-3xl font-bold text-center mb-2">
              {destination.name}
            </Text>
            <Text className="text-dark-textMuted text-center mb-4">
              {destination.country}
            </Text>
            <Text className="text-dark-text text-center italic mb-6">
              {destination.tagline}
            </Text>

            <View className="flex-row justify-around mb-4">
              <View className="items-center">
                <Text className="text-coral font-bold text-lg">{destination.days}</Text>
                <Text className="text-dark-textMuted text-xs">Days</Text>
              </View>
              <View className="items-center">
                <Text className="text-coral font-bold text-lg">${destination.budgetUSD}</Text>
                <Text className="text-dark-textMuted text-xs">Budget</Text>
              </View>
              <View className="items-center">
                <Text className="text-coral font-bold text-lg">{destination.ratingAverage}</Text>
                <Text className="text-dark-textMuted text-xs">Rating</Text>
              </View>
            </View>
          </View>

          <View className="bg-dark-surface rounded-lg p-4 mb-4">
            <Text className="text-dark-text font-semibold mb-2">About</Text>
            <Text className="text-dark-textMuted">{destination.description}</Text>
          </View>

          <View className="bg-dark-surface rounded-lg p-4 mb-4">
            <Text className="text-dark-text font-semibold mb-2">Best Season</Text>
            <Text className="text-dark-textMuted">{destination.bestSeason}</Text>
          </View>

          <View className="bg-dark-surface rounded-lg p-4 mb-4">
            <Text className="text-dark-text font-semibold mb-2">Hidden Gem</Text>
            <Text className="text-dark-textMuted">{destination.hiddenGem}</Text>
          </View>

          <TouchableOpacity className="bg-coral w-full py-4 rounded-lg mb-4">
            <Text className="text-white text-center font-semibold text-lg">Clone This Trip ⚡</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
