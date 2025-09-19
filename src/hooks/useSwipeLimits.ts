import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface SwipeLimitData {
  dailyLimit: number
  remainingSwipes: number
  canSwipe: boolean
  isPremium: boolean
  loading: boolean
  error: string | null
  refresh: () => void
}

export const useSwipeLimits = (): SwipeLimitData => {
  const { user } = useAuth()
  const [swipeData, setSwipeData] = useState<SwipeLimitData>({
    dailyLimit: 30,
    remainingSwipes: 30,
    canSwipe: true,
    isPremium: false,
    loading: true,
    error: null,
    refresh: () => {}
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
          dailyLimit: 20,
          remainingSwipes: 20,
          canSwipe: true,
          isPremium: false,
          loading: false,
          error: null,
          refresh: refreshSwipeData
        })
        return
      }

      const isPremium = profile?.is_premium || false
      const dailyLimit = isPremium ? 50 : 20

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
          isPremium,
          loading: false,
          error: null,
          refresh: refreshSwipeData
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
        isPremium,
        loading: false,
        error: null,
        refresh: refreshSwipeData
      })

    } catch (error) {
      console.error('useSwipeLimits: Error fetching swipe data', error)
      setSwipeData(prev => ({
        dailyLimit: 20,
        remainingSwipes: 20,
        canSwipe: true,
        isPremium: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados de swipe',
        refresh: refreshSwipeData
      }))
    }
  }

  return swipeData
}

export const incrementSwipeCount = async (userId: string): Promise<boolean> => {
  try {
    console.log('incrementSwipeCount: Incrementing swipe count for user', userId)
    
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
    // Use RPC function to safely increment the count
    const { data, error } = await supabase
      .rpc('increment_daily_swipe_count', {
        p_user_id: userId,
        p_date: today
      })

    if (error) {
      console.error('incrementSwipeCount: RPC failed', error)
      
      // Fallback to manual upsert if RPC doesn't exist
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
    }

    // Atualizar progresso da tarefa de swipes
    try {
      await supabase.rpc('update_swipe_task_progress', { p_user_id: userId })
    } catch (taskError) {
      console.warn('incrementSwipeCount: Failed to update swipe task progress:', taskError)
    }

    console.log('incrementSwipeCount: Successfully incremented swipe count')
    return true
  } catch (error) {
    console.error('incrementSwipeCount: Exception occurred', error)
    return false
  }
}

export const decrementSwipeCount = async (userId: string): Promise<boolean> => {
  try {
    console.log('decrementSwipeCount: Decrementing swipe count for user', userId)
    
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
    // Get current count
    const { data: currentData, error: selectError } = await supabase
      .from('daily_swipe_counts')
      .select('swipe_count')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()

    if (selectError) {
      console.error('decrementSwipeCount: Error getting current count', selectError)
      return false
    }

    const currentCount = currentData?.swipe_count || 0
    const newCount = Math.max(0, currentCount - 1) // Don't go below 0

    console.log('decrementSwipeCount: Current count:', currentCount, 'New count:', newCount)

    // Update the count
    const { error: updateError } = await supabase
      .from('daily_swipe_counts')
      .update({
        swipe_count: newCount
      })
      .eq('user_id', userId)
      .eq('date', today)

    if (updateError) {
      console.error('decrementSwipeCount: Update failed', updateError)
      return false
    }

    console.log('decrementSwipeCount: Successfully decremented swipe count')
    return true
  } catch (error) {
    console.error('decrementSwipeCount: Exception occurred', error)
    return false
  }
}