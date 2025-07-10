import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface SwipeLimitData {
  dailyLimit: number
  remainingSwipes: number
  canSwipe: boolean
  loading: boolean
  error: string | null
}

export const useSwipeLimits = (): SwipeLimitData => {
  const { user } = useAuth()
  const [swipeData, setSwipeData] = useState<SwipeLimitData>({
    dailyLimit: 30,
    remainingSwipes: 30,
    canSwipe: true,
    loading: true,
    error: null
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (user) {
      fetchSwipeData()
    }
  }, [user, refreshTrigger])

  // Function to manually refresh data
  const refreshSwipeData = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const fetchSwipeData = async () => {
    if (!user) return

    try {
      console.log('useSwipeLimits: Fetching swipe data for user', user.id)
      
      // Get user's profile to check premium status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error('useSwipeLimits: Error fetching profile', profileError)
        // Don't throw, just use default values
        setSwipeData({
          dailyLimit: 30,
          remainingSwipes: 30,
          canSwipe: true,
          loading: false,
          error: null
        })
        return
      }

      const isPremium = profile?.is_premium || false
      const dailyLimit = isPremium ? 100 : 30

      console.log('useSwipeLimits: User premium status', { isPremium, dailyLimit })

      // Get today's swipe count
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      
      const { data: swipeCount, error: swipeError } = await supabase
        .from('daily_swipe_counts')
        .select('swipe_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()

      if (swipeError) {
        console.error('useSwipeLimits: Error fetching swipe count', swipeError)
        // Don't throw, just use default values
        setSwipeData({
          dailyLimit,
          remainingSwipes: dailyLimit,
          canSwipe: true,
          loading: false,
          error: null
        })
        return
      }

      const currentSwipes = swipeCount?.swipe_count || 0
      const remainingSwipes = Math.max(0, dailyLimit - currentSwipes)
      const canSwipe = remainingSwipes > 0

      console.log('useSwipeLimits: Swipe data calculated', {
        currentSwipes,
        dailyLimit,
        remainingSwipes,
        canSwipe
      })

      setSwipeData({
        dailyLimit,
        remainingSwipes,
        canSwipe,
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('useSwipeLimits: Error fetching swipe data', error)
      setSwipeData(prev => ({
        dailyLimit: 30,
        remainingSwipes: 30,
        canSwipe: true,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados de swipe'
      }))
    }
  }

  return swipeData
}

export const incrementSwipeCount = async (userId: string): Promise<boolean> => {
  try {
    console.log('incrementSwipeCount: Incrementing swipe count for user', userId)
    
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
    // First, get current count
    const { data: currentData, error: selectError } = await supabase
      .from('daily_swipe_counts')
      .select('swipe_count')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()

    if (selectError) {
      console.error('incrementSwipeCount: Error getting current count', selectError)
      return false
    }

    const currentCount = currentData?.swipe_count || 0
    const newCount = currentCount + 1

    console.log('incrementSwipeCount: Current count:', currentCount, 'New count:', newCount)

    // Upsert the new count
    const { error: upsertError } = await supabase
      .from('daily_swipe_counts')
      .upsert({
        user_id: userId,
        date: today,
        swipe_count: newCount
      }, {
        onConflict: 'user_id,date'
      })

    if (upsertError) {
      console.error('incrementSwipeCount: Upsert failed', upsertError)
      return false
    }

    console.log('incrementSwipeCount: Successfully incremented swipe count')
    return true
  } catch (error) {
    console.error('incrementSwipeCount: Exception occurred', error)
    return false
  }
}