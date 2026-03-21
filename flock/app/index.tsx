import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'

export default function Index() {
  const router = useRouter()
  const [isReady, setIsReady] = React.useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace('/(tabs)/explore')
      } else {
        router.replace('/(auth)/welcome')
      }
      setIsReady(true)
    }
    checkSession()
  }, [])

  return (
    <View className="flex-1 justify-center items-center bg-dark-bg">
      <Text className="text-dark-text text-lg">Loading FLOCK...</Text>
    </View>
  )
}
