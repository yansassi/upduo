import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { SwipeCard } from './SwipeCard'
import { Heart, X, Sparkles, Users, Clock, Crown, RotateCcw } from 'lucide-react'
import { useSwipeLimits, incrementSwipeCount, decrementSwipeCount } from '../hooks/useSwipeLimits'

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

interface LastSwipeInfo {
  profile: Profile
  swipeId: string
  direction: 'left' | 'right'
}

export const SwipeInterface: React.FC = () => {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [matchFound, setMatchFound] = useState<Profile | null>(null)
  const [lastSwipeInfo, setLastSwipeInfo] = useState<LastSwipeInfo | null>(null)
  const [rewindLoading, setRewindLoading] = useState(false)
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
        setProfiles([])
      } else {
        setProfiles(profiles || [])
        setCurrentIndex(0) // Reset index when fetching new profiles
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
        .limit(5)

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
    if (!user || currentIndex >= profiles.length || !swipeLimits.canSwipe) {
      console.log('SwipeInterface: Cannot swipe', {
        hasUser: !!user,
        currentIndex,
        profilesLength: profiles.length,
        canSwipe: swipeLimits.canSwipe
      })
      return
    }

    const swipedProfile = profiles[currentIndex]
    
    if (!swipedProfile) {
      console.error('SwipeInterface: No profile found at current index', currentIndex)
      return
    }
    
    const isLike = direction === 'right'

    // Scroll to top when swiping
    window.scrollTo({ top: 0, behavior: 'smooth' })

    console.log('SwipeInterface: Handling swipe', {
      direction,
      isLike,
      swiperId: user.id,
      swipedId: swipedProfile.id,
      swipedProfileName: swipedProfile.name,
      currentIndex
    })

    try {
      // Check if this swipe already exists (safety check)
      const { data: existingSwipe, error: checkError } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', user.id)
        .eq('swiped_id', swipedProfile.id)
        .maybeSingle()

      if (checkError) {
        console.error('SwipeInterface: Error checking existing swipe', checkError)
        throw checkError
      }

      if (existingSwipe) {
        console.warn('SwipeInterface: Swipe already exists, skipping to next profile')
        setCurrentIndex(prev => prev + 1)
        return
      }

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

      if (swipeError) {
        console.error('SwipeInterface: Error inserting swipe', {
          error: swipeError,
          swiperId: user.id,
          swipedId: swipedProfile.id,
          isLike,
          errorCode: swipeError.code,
          errorMessage: swipeError.message,
          errorDetails: swipeError.details
        })
        
        // Handle specific error cases
        if (swipeError.code === '23505') {
          console.warn('SwipeInterface: Duplicate swipe detected, moving to next profile')
          setCurrentIndex(prev => prev + 1)
          return
        }
        
        // For any other error, throw it to be caught by outer try-catch
        throw swipeError
      }

      // Increment swipe count
      const swipeCountUpdated = await incrementSwipeCount(user.id)
      if (!swipeCountUpdated) {
        console.warn('SwipeInterface: Failed to update swipe count')
      }

      // Store the last swipe info for premium users to potentially rewind
      if (swipeLimits.isPremium && swipeData && swipeData.length > 0) {
        setLastSwipeInfo({
          profile: swipedProfile,
          swipeId: swipeData[0].id,
          direction
        })
        console.log('SwipeInterface: Stored last swipe info for rewind', {
          profileName: swipedProfile.name,
          swipeId: swipeData[0].id,
          direction
        })
      }

      // Move to next profile AFTER storing swipe info
      setCurrentIndex(prev => prev + 1)
      console.log('SwipeInterface: Moving to next profile', { 
        oldIndex: currentIndex, 
        newIndex: currentIndex + 1 
      })

      // Refresh swipe limits to update remaining count
      swipeLimits.refresh()

      // Check for match if it's a like
      if (isLike) {
        console.log('SwipeInterface: Checking for mutual like...')
        
        const { data: mutualSwipe, error: mutualCheckError } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', swipedProfile.id)
          .eq('swiped_id', user.id)
          .eq('is_like', true)
          .maybeSingle()

        console.log('SwipeInterface: Mutual like check result', { mutualSwipe, mutualCheckError })

        if (mutualCheckError) {
          console.error('SwipeInterface: Error checking for mutual like', mutualCheckError)
        }

        if (mutualSwipe) {
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
            }
          } else {
            console.log('SwipeInterface: Match created successfully!')
            setMatchFound(swipedProfile)
          }
        }
      }
    } catch (error) {
      console.error('Error handling swipe:', error)
      
      // More specific error handling
      let errorMessage = 'Erro ao processar swipe. Tente novamente.'
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as any
        if (errorObj.message?.includes('duplicate key')) {
          errorMessage = 'Você já avaliou este perfil. Passando para o próximo...'
          setCurrentIndex(prev => prev + 1)
          return
        }
      }
      
      alert(errorMessage)
    }
  }

  const handleRewind = async () => {
    if (!user || !swipeLimits.isPremium || !lastSwipeInfo || rewindLoading) {
      console.log('SwipeInterface: Cannot rewind', {
        hasUser: !!user,
        isPremium: swipeLimits.isPremium,
        hasLastSwipeInfo: !!lastSwipeInfo,
        rewindLoading
      })
      return
    }

    console.log('SwipeInterface: Starting rewind process', {
      userId: user.id,
      lastSwipedProfile: lastSwipeInfo.profile.name,
      swipeId: lastSwipeInfo.swipeId,
      direction: lastSwipeInfo.direction,
      currentIndex
    })

    setRewindLoading(true)
    try {
      // 1. Delete the swipe record from database
      console.log('SwipeInterface: Attempting to delete swipe record', {
        swipeId: lastSwipeInfo.swipeId,
        userId: user.id
      })
      
      const { error: deleteError } = await supabase
        .from('swipes')
        .delete()
        .eq('id', lastSwipeInfo.swipeId)
        .eq('swiper_id', user.id) // Extra security check

      if (deleteError) {
        console.error('SwipeInterface: Error deleting swipe record', {
          error: deleteError,
          swipeId: lastSwipeInfo.swipeId,
          errorCode: deleteError.code,
          errorMessage: deleteError.message,
          errorDetails: deleteError.details
        })
        throw deleteError
      }

      console.log('SwipeInterface: Successfully deleted swipe record')

      // 2. Decrement the daily swipe count
      const swipeCountDecremented = await decrementSwipeCount(user.id)
      if (!swipeCountDecremented) {
        console.warn('SwipeInterface: Failed to decrement swipe count')
      }

      // 3. Restore the profile and fix the state
      const restoredProfile = lastSwipeInfo.profile
      const newIndex = Math.max(0, currentIndex - 1)

      console.log('SwipeInterface: Restoring profile', {
        profileName: restoredProfile.name,
        newIndex,
        currentIndex
      })

      // Insert the profile back at the correct position
      setProfiles(prev => {
        const newProfiles = [...prev]
        // Remove the profile if it exists in the array to avoid duplicates
        const existingIndex = newProfiles.findIndex(p => p.id === restoredProfile.id)
        if (existingIndex !== -1) {
          newProfiles.splice(existingIndex, 1)
        }
        // Insert at the correct position
        newProfiles.splice(newIndex, 0, restoredProfile)
        return newProfiles
      })

      // Set index back to the restored profile
      setCurrentIndex(newIndex)

      // 4. Clear the last swipe info
      setLastSwipeInfo(null)

      // 5. Refresh swipe limits
      swipeLimits.refresh()

      console.log('SwipeInterface: Rewind completed successfully', {
        restoredProfileName: restoredProfile.name,
        newIndex
      })

    } catch (error) {
      console.error('Error handling rewind:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Erro ao desfazer último swipe. Tente novamente.'
      
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as any
        if (supabaseError.code === '42501') {
          errorMessage = 'Permissão negada. Você não pode desfazer este swipe.'
        } else if (supabaseError.code === '23503') {
          errorMessage = 'Erro de integridade dos dados. Tente novamente.'
        }
      }
      
      alert(errorMessage)
    } finally {
      setRewindLoading(false)
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

        {/* Swipe Limits Info */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white text-sm">
              {swipeLimits.remainingSwipes} swipes restantes
            </span>
            {swipeLimits.isPremium && (
              <Crown className="w-4 h-4 text-yellow-400" />
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`profile-${currentProfile.id}-${currentIndex}`}
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
        <div className="flex justify-center items-center space-x-4 mt-8 mb-4">
          {/* Rewind Button - Only for Premium users */}
          {swipeLimits.isPremium && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRewind}
              disabled={!lastSwipeInfo || rewindLoading}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                !lastSwipeInfo || rewindLoading
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
              title="Desfazer último swipe (Premium)"
            >
              {rewindLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <RotateCcw className="w-6 h-6 text-white" />
              )}
            </motion.button>
          )}
          
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
        
        {/* Premium Rewind Info */}
        {swipeLimits.isPremium && (
          <div className="text-center mb-4">
            <p className="text-xs text-blue-200">
              {lastSwipeInfo 
                ? `💎 Você pode desfazer o último ${lastSwipeInfo.direction === 'right' ? 'like' : 'pass'}` 
                : '💎 Funcionalidade Premium: Desfazer swipes'
              }
            </p>
          </div>
        )}

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
                <span className="font-bold text-blue-600">100 swipes por dia</span>!
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const whatsappNumber = '5545988349638'
                    const message = encodeURIComponent('Olá! Quero ser premium do UpDuo. Pode me ajudar com a assinatura?')
                    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
                    window.open(whatsappUrl, '_blank')
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
                  💎 Premium inclui: 100 swipes por dia, badge verificado e prioridade nos matches!
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