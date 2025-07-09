import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Edit2, MapPin, Calendar, Trophy, Sword, Target, Quote } from 'lucide-react'
import { getHeroImageUrl, getRankImageUrl, getLineImageUrl } from '../constants/gameData'

interface Profile {
  id: string
  name: string
  age: number
  city: string
  current_rank: string
  favorite_heroes: string[]
  favorite_lines: string[]
  bio: string
  created_at: string
}

export const ProfileView: React.FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('ProfileView: Error fetching profile', error)
        throw error
      }
      
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Perfil não encontrado</h2>
          <p className="text-blue-200">Ocorreu um erro ao carregar seu perfil</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-4">
      <div className="max-w-md mx-auto pt-8 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
          <p className="text-blue-200">Assim outros jogadores te veem</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
            >
              <Edit2 className="w-5 h-5" />
            </motion.button>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{profile.age} anos</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{profile.city}</span>
            </div>
          </div>

          {/* Rank */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-800">Elo Atual</h3>
            </div>
            <div className="flex items-center space-x-3">
              <img
                src={getRankImageUrl(profile.current_rank)}
                alt={profile.current_rank}
                className="w-12 h-12"
              />
              <span className="text-xl font-bold text-gray-800">{profile.current_rank}</span>
            </div>
          </div>

          {/* Heroes */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Sword className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">Heróis Favoritos</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {profile.favorite_heroes.map((hero) => (
                <motion.div
                  key={hero}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <img
                    src={getHeroImageUrl(hero)}
                    alt={hero}
                    className="w-16 h-16 mx-auto rounded-lg shadow-md mb-2"
                  />
                  <p className="text-xs font-medium text-gray-700 truncate">{hero}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Lines */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Linhas Favoritas</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {profile.favorite_lines.map((line) => (
                <motion.div
                  key={line}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <img
                    src={getLineImageUrl(line)}
                    alt={line}
                    className="w-12 h-12 mx-auto rounded-lg shadow-md mb-2"
                  />
                  <p className="text-xs font-medium text-gray-700 capitalize">{line}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <Quote className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Sobre</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="p-6 bg-gray-50">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}