import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle, Users, Heart } from 'lucide-react'
import { getRankImageUrl } from '../constants/gameData'

interface Match {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  profile: {
    id: string
    name: string
    age: number
    city: string
    current_rank: string
    favorite_heroes: string[]
    favorite_lines: string[]
  }
}

export const MatchesList: React.FC = () => {
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
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select(`
          *,
          profile:profiles!matches_user2_id_fkey(*)
        `)
        .eq('user1_id', user.id)
        .order('created_at', { ascending: false })

      console.log('MatchesList: Matches where user is user1', { matchesData, error })

      if (error) throw error

      // Also get matches where current user is user2
      const { data: matchesData2, error: error2 } = await supabase
        .from('matches')
        .select(`
          *,
          profile:profiles!matches_user1_id_fkey(*)
        `)
        .eq('user2_id', user.id)
        .order('created_at', { ascending: false })

      console.log('MatchesList: Matches where user is user2', { matchesData2, error2 })

      if (error2) throw error2

      const allMatches = [...(matchesData || []), ...(matchesData2 || [])]
      
      console.log('MatchesList: All matches combined', allMatches)
      
      setMatches(allMatches)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-4">
      <div className="max-w-md mx-auto pt-8 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Seus Matches</h1>
          <p className="text-blue-200">Jogadores que também te curtiram</p>
        </div>

        <div className="space-y-4">
          {matches.map((match) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {match.profile.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {match.profile.age} anos • {match.profile.city}
                    </p>
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

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Match em {new Date(match.created_at).toLocaleDateString('pt-BR')}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Conversar</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}