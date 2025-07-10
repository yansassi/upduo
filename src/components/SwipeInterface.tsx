import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { SwipeCard } from './SwipeCard'
import { Heart, X, Sparkles, Users, Clock, Crown } from 'lucide-react'
import { useSwipeLimits, incrementSwipeCount } from '../hooks/useSwipeLimits'

interface Profile {
  id: string
  name: string
  age: number
  city: string
  current_rank: string
  favorite_heroes: string[]
  favorite_lines: string[]
  bio: string
  is_premium: boolean
}

export const SwipeInterface: React.FC = () => {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [matchFound, setMatchFound] = useState<Profile | null>(null)
  const swipeLimits = useSwipeLimits()

  useEffect(() => {
    fetchProfiles()
  }, [user])

  // Pré-carregar mais perfis quando estiver próximo do fim
  useEffect(() => {
    const shouldPreload = currentIndex >= profiles.length - 2 && 
                         profiles.length > 0 && 
                         !loading
    
    if (shouldPreload) {
      console.log('SwipeInterface: Pre-loading more profiles')
      fetchMoreProfiles()
    }
  }, [currentIndex, profiles.length, loading])

  const fetchProfiles = async () => {
    if (!user) return

    console.log('SwipeInterface: Fetching profiles for user', user.id)
    setLoading(true)

    try {
      // Get profiles that haven't been swiped yet
      const { data: swipedProfiles } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id)

      console.log('SwipeInterface: Previously swiped profiles', swipedProfiles)

      const swipedIds = swipedProfiles?.map(s => s.swiped_id) || []
      
      console.log('SwipeInterface: Swiped IDs array', swipedIds)

      // Build query conditionally based on whether there are swiped profiles
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(10)

      // Only add the 'not in' filter if there are actually swiped profiles
      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`)
      }

      const { data: profiles, error } = await query

      console.log('SwipeInterface: Fetched profiles', { profiles, error })

      if (error) {
        console.error('SwipeInterface: Error fetching profiles', error)
        // Don't throw, just set empty array
        setProfiles([])
      } else {
        setProfiles(profiles || [])
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMoreProfiles = async () => {
    if (!user) return

    try {
      // Get profiles that haven't been swiped yet
      const { data: swipedProfiles } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id)

      const swipedIds = swipedProfiles?.map(s => s.swiped_id) || []
      const loadedIds = profiles.map(p => p.id)
      const excludedIds = [...swipedIds, ...loadedIds]
      
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(5) // Carregar menos perfis por vez

      if (excludedIds.length > 0) {
        query = query.not('id', 'in', `(${excludedIds.join(',')})`)
      }

      const { data: newProfiles, error } = await query

      if (error) throw error
      
      if (newProfiles && newProfiles.length > 0) {
        setProfiles(prev => [...prev, ...newProfiles])
        console.log('SwipeInterface: Added', newProfiles.length, 'more profiles')
      }
    } catch (error) {
      console.error('Error fetching more profiles:', error)
    }
  }

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || currentIndex >= profiles.length) return
    const swipedProfile = profiles[currentIndex]
    const isLike = direction === 'right'

    console.log('SwipeInterface: Handling swipe', {
      direction,
      isLike,
      swiperId: user.id,
      swipedId: swipedProfile.id,
      swipedProfileName: swipedProfile.name
    })

    try {
      // Record the swipe
      const { data: swipeData, error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: swipedProfile.id,
          is_like: isLike
        })
        .select()

      console.log('SwipeInterface: Swipe insertion result', { swipeData, swipeError })

      if (swipeError) throw swipeError

      // Check for match if it's a like
      if (isLike) {
        console.log('SwipeInterface: Checking for mutual like...')
        
        const { data: existingSwipe, error: checkError } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', swipedProfile.id)
          .eq('swiped_id', user.id)
          .eq('is_like', true)
          .maybeSingle()

        console.log('SwipeInterface: Mutual like check result', { existingSwipe, checkError })

        if (checkError) {
          console.error('SwipeInterface: Error checking for mutual like', checkError)
        }

        if (existingSwipe) {
          // It's a match!
          console.log('SwipeInterface: Creating match!')
          
          // Ensure canonical ordering of user IDs to prevent duplicate matches
          const user1_id = user.id < swipedProfile.id ? user.id : swipedProfile.id
          const user2_id = user.id < swipedProfile.id ? swipedProfile.id : user.id
          
          console.log('SwipeInterface: Using canonical order', { user1_id, user2_id })
          
          const { data: matchData, error: matchError } = await supabase
            .from('matches')
            .insert({
              user1_id,
              user2_id
            })
            .select()

          console.log('SwipeInterface: Match creation result', { matchData, matchError })

          if (matchError) {
            // Check if it's a unique constraint violation (match already exists)
            if (matchError.code === '23505') {
              console.log('SwipeInterface: Match already exists, showing match modal anyway')
              setMatchFound(swipedProfile)
            } else {
              console.error('SwipeInterface: Error creating match', matchError)
              // Don't throw here, just log the error
            }
          } else {
            console.log('SwipeInterface: Match created successfully!')
            setMatchFound(swipedProfile)
          }
        } else {
          console.log('SwipeInterface: No mutual like found, no match created')
        }
      } else {
        console.log('SwipeInterface: Swipe was not a like, skipping match check')
      }

      // Move to next profile
      console.log('SwipeInterface: Moving to next profile')
      setCurrentIndex(currentIndex + 1)

      // Increment swipe count after successful swipe
      const swipeCountUpdated = await incrementSwipeCount(user.id)
      if (!swipeCountUpdated) {
        console.warn('SwipeInterface: Failed to update swipe count')
      }
    } catch (error) {
      console.error('Error handling swipe:', error)
      // Show user-friendly error message
      alert('Erro ao processar swipe. Tente novamente.')
    }
  }

  const currentProfile = profiles[currentIndex]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Procurando jogadores...</p>
        </div>
      </div>
    )
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-60" />
          <h2 className="text-2xl font-bold mb-2">Não há mais jogadores</h2>
          <p className="text-blue-200">Volte mais tarde para encontrar novos duos!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-4">
      <div className="max-w-md mx-auto pt-8 pb-24">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Encontre seu Duo</h1>
          <p className="text-blue-200">Deslize para encontrar jogadores compatíveis</p>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProfile.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <SwipeCard
              profile={currentProfile}
              onSwipe={handleSwipe}
            />
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 mt-8 mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            disabled={!swipeLimits.canSwipe}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              !swipeLimits.canSwipe
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            <X className="w-8 h-8 text-white" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            disabled={!swipeLimits.canSwipe}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              !swipeLimits.canSwipe
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            <Heart className="w-8 h-8 text-white" />
          </motion.button>
        </div>

        {/* No swipes left overlay */}
        {!swipeLimits.canSwipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
            >
              <div className="relative mb-6">
                <Clock className="w-16 h-16 mx-auto text-red-500" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Limite Atingido!</h2>
              <p className="text-gray-600 mb-6">
                Você usou todos os seus swipes de hoje. Assine Premium por apenas{' '}
                <span className="font-bold text-green-600">R$ 25</span> e tenha{' '}
                <span className="font-bold text-blue-600">swipes ilimitados</span>!
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Em produção, isso abriria o fluxo de pagamento
                    alert('Redirecionando para pagamento... (Em desenvolvimento)')
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Crown className="w-5 h-5" />
                  <span>Assinar Premium - R$ 25</span>
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                >
                  Voltar Amanhã
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  ✨ Premium inclui: Swipes ilimitados, badge verificado e prioridade nos matches!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Match Modal */}
      <AnimatePresence>
        {matchFound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
            >
              <div className="relative mb-6">
                <Sparkles className="w-16 h-16 mx-auto text-yellow-500" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">É um Match!</h2>
              <p className="text-gray-600 mb-6">
                Você e {matchFound.name} se curtiram mutuamente!
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setMatchFound(null)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Continuar Procurando
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}