import React from 'react'
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { Destinations } from '../../../constants/destinations'

export default function Explore() {
  const router = useRouter()

  const renderDestinationCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/explore/${item.id}`)}
      className="bg-dark-surface rounded-lg p-4 mb-4 border border-dark-border"
    >
      <View className="flex-row items-start mb-3">
        <Text className="text-4xl mr-3">{item.emoji}</Text>
        <View className="flex-1">
          <Text className="text-dark-text font-semibold text-lg">{item.name}</Text>
          <Text className="text-dark-textMuted text-sm">{item.country}</Text>
        </View>
        <View className="bg-dark-surfaceHigh px-2 py-1 rounded">
          <Text className="text-brand-coral text-xs font-semibold">⭐ {item.ratingAverage}</Text>
        </View>
      </View>
      <Text className="text-dark-text text-sm mb-3">{item.description}</Text>
      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-3">
          <Text className="text-dark-textMuted text-xs">{item.days} days</Text>
          <Text className="text-dark-textMuted text-xs">${item.budgetUSD}</Text>
        </View>
        <View className="bg-dark-surfaceHigh px-3 py-1 rounded-full">
          <Text className="text-coral text-xs font-semibold">⚡ {item.cloneCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-dark-bg">
      <View className="px-4 pt-4">
        <Text className="text-dark-text text-3xl font-bold mb-2">Explore</Text>
        <Text className="text-dark-textMuted mb-6">Where will your flock fly?</Text>
      </View>
      <FlatList
        data={Destinations}
        renderItem={renderDestinationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        scrollEnabled={true}
      />
    </SafeAreaView>
  )
}
