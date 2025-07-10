import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle, Users, Heart, User, BadgeCheck } from 'lucide-react'
import { getRankImageUrl } from '../constants/gameData'

interface Match {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  user1_last_read_message_id: string | null
  user2_last_read_message_id: string | null
  profile: {
    id: string
    name: string
    current_rank: string
    favorite_heroes: string[]
    favorite_lines: string[]
    avatar_url: string | null
    is_premium: boolean
  }
  lastMessage?: {
    id: string
    sender_id: string
    message_text: string
    created_at: string
  }
  hasUnreadMessages?: boolean
  hasMessages?: boolean
}

interface MatchesListProps {
  onOpenChat: (matchId: string) => void
  onUnreadStatusChange?: (hasUnread: boolean) => void
}

export const MatchesList: React.FC<MatchesListProps> = ({ onOpenChat, onUnreadStatusChange }) => {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('MatchesList: Component mounted, fetching matches')
    fetchMatches()
  }, [user])

  const fetchMatches = async () => {
    if (!user) return

    console.log('MatchesList: Fetching matches for user', user.id)

    try {
      // Get matches where current user is user1
      const { data: matchesData1, error: error1 } = await supabase
        .from('matches')
        .select(`
          *,
          profile1:profiles!matches_user1_id_fkey(id, name, current_rank, favorite_heroes, favorite_lines, avatar_url),
          profile2:profiles!matches_user2_id_fkey(id, name, current_rank, favorite_heroes, favorite_lines, avatar_url)
        `)
        .eq('user1_id', user.id)
        .order('created_at', { ascending: false })

      console.log('MatchesList: Matches where user is user1', { matchesData1, error1 })

      if (error1) throw error1

      // Get matches where current user is user2
      const { data: matchesData2, error2 } = await supabase
        .from('matches')
        .select(`
          *,
          profile1:profiles!matches_user1_id_fkey(id, name, current_rank, favorite_heroes, favorite_lines, avatar_url),
          profile2:profiles!matches_user2_id_fkey(id, name, current_rank, favorite_heroes, favorite_lines, avatar_url)
        `)
        .eq('user2_id', user.id)
        .order('created_at', { ascending: false })

      console.log('MatchesList: Matches where user is user2', { matchesData2, error2 })

      if (error2) throw error2

      const allRawMatches = [...(matchesData1 || []), ...(matchesData2 || [])]
      
      console.log('MatchesList: All raw matches combined', allRawMatches)
      
      // Process matches to get the correct profile and check for unread messages
      const processedMatches: Match[] = []
      let hasAnyUnread = false

      for (const rawMatch of allRawMatches) {
        // Determine which profile is the "other" user
        const isCurrentUserUser1 = rawMatch.user1_id === user.id
        const otherProfile = isCurrentUserUser1 ? rawMatch.profile2 : rawMatch.profile1
        const currentUsersLastReadMessageId = isCurrentUserUser1 
          ? rawMatch.user1_last_read_message_id 
          : rawMatch.user2_last_read_message_id

        // Get the latest message for this conversation
        const { data: latestMessage } = await supabase
          .from('messages')
          .select('id, sender_id, message_text, created_at')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherProfile.id}),and(sender_id.eq.${otherProfile.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Determine if there are messages and unread messages
        const hasMessages = !!latestMessage
        let hasUnreadMessages = false
        
        if (latestMessage && latestMessage.sender_id === otherProfile.id) {
          // The latest message is from the other user
          if (!currentUsersLastReadMessageId || latestMessage.id !== currentUsersLastReadMessageId) {
            hasUnreadMessages = true
            hasAnyUnread = true
          }
        }

        const processedMatch: Match = {
          ...rawMatch,
          profile: otherProfile,
          lastMessage: latestMessage || undefined,
          hasUnreadMessages,
          hasMessages
        }

        processedMatches.push(processedMatch)
      }
      
      console.log('MatchesList: Processed matches with unread status', processedMatches)
      setMatches(processedMatches)
      
      // Notify parent component about unread status
      if (onUnreadStatusChange) {
        onUnreadStatusChange(hasAnyUnread)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando matches...</p>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-60" />
          <h2 className="text-2xl font-bold mb-2">Nenhum match ainda</h2>
          <p className="text-blue-200">Continue procurando para encontrar seus duos!</p>
        </div>
      </div>
    )
  }

  // Separate matches into initiated and uninitiated
  const uninitiatedMatches = matches.filter(match => !match.hasMessages)
  const initiatedMatches = matches.filter(match => match.hasMessages)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-4">
      <div className="max-w-md mx-auto pt-8 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Seus Matches</h1>
          <p className="text-blue-200">Jogadores que também te curtiram</p>
        </div>

        {/* Uninitiated Matches - Tinder Style */}
        {uninitiatedMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-400" />
              Novos Matches
            </h2>
            <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
              {uninitiatedMatches.map((match) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onOpenChat(match.id)}
                  className="cursor-pointer flex-shrink-0"
                >
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                      {match.profile.avatar_url ? (
                        <img
                          src={match.profile.avatar_url}
                          alt={match.profile.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    {/* New match indicator */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Heart className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <p className="text-white text-xs text-center mt-2 font-medium truncate">
                    {match.profile.name}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Initiated Matches - Conversation List */}
        {initiatedMatches.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
              Conversas
            </h2>
            <div className="space-y-4">
              {initiatedMatches.map((match) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onOpenChat(match.id)}
                  className="bg-white rounded-xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all relative"
                >
                  {/* Unread message indicator */}
                  {match.hasUnreadMessages && (
                    <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                        {match.profile.avatar_url ? (
                          <img
                            src={match.profile.avatar_url}
                            alt={match.profile.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onLoad={() => console.log('MatchesList: Avatar loaded successfully:', match.profile.avatar_url)}
                            onError={() => console.error('MatchesList: Error loading avatar:', match.profile.avatar_url)}
                          />
                        ) : (
                          <Users className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {match.profile.name}
                          </h3>
                          {match.profile.is_premium && (
                            <BadgeCheck className="w-4 h-4 text-blue-500 ml-1" />
                          )}
                        </div>
                        {match.lastMessage && (
                          <p className="text-sm text-gray-500 truncate max-w-48">
                            {match.lastMessage.message_text}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <img
                        src={getRankImageUrl(match.profile.current_rank)}
                        alt={match.profile.current_rank}
                        className="w-8 h-8"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {match.profile.current_rank}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no matches */}
        {uninitiatedMatches.length === 0 && initiatedMatches.length === 0 && (
          <div className="text-center text-white">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-60" />
            <h2 className="text-2xl font-bold mb-2">Nenhum match ainda</h2>
            <p className="text-blue-200">Continue procurando para encontrar seus duos!</p>
          </div>
        )}
      </div>
    </div>
  )
}