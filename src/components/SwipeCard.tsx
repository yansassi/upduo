import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Trophy, Sword, Target, Quote, User, BadgeCheck, Zap } from 'lucide-react'
import { getHeroImageUrl, getRankImageUrl, getLineImageUrl } from '../constants/gameData'
import { getStateAbbrByCity } from '../utils/locationUtils'
import { calculateCompatibility, getCompatibilityDescription, getCompatibilityColor } from '../utils/compatibilityUtils'
import { getCountryFlag, getCountryName } from '../utils/countryUtils'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Profile {
  id: string
  name: string
  age: number
  country: string
  city: string
  current_rank: string
  favorite_heroes: string[]
  favorite_lines: string[]
  bio: string
  avatar_url?: string | null
  is_premium?: boolean
}

interface SwipeCardProps {
  profile: Profile
  onSwipe: (direction: 'left' | 'right') => void
  showCompatibility?: boolean
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe, showCompatibility = false }) => {
  const { user } = useAuth()
  const [stateAbbr, setStateAbbr] = useState<string | null>(null)
  const [compatibility, setCompatibility] = useState<any>(null)
  const [loadingCompatibility, setLoadingCompatibility] = useState(false)

  useEffect(() => {
    const fetchStateAbbr = async () => {
      if (profile.city) {
        try {
          const abbr = await getStateAbbrByCity(profile.city, profile.country)
          setStateAbbr(abbr)
        } catch (error) {
          console.error('Error fetching state abbreviation:', error)
          setStateAbbr(null)
        }
      }
    }

    fetchStateAbbr()
  }, [profile.city])

  useEffect(() => {
    if (showCompatibility && user) {
      fetchCompatibility()
    }
  }, [showCompatibility, user, profile.id])

  const fetchCompatibility = async () => {
    if (!user) return
    
    setLoadingCompatibility(true)
    try {
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('favorite_heroes, favorite_lines, current_rank, city')
        .eq('id', user.id)
        .single()

      if (currentUserProfile) {
        const compatibilityScore = calculateCompatibility(currentUserProfile, profile)
        setCompatibility(compatibilityScore)
      }
    } catch (error) {
      console.error('Error calculating compatibility:', error)
    } finally {
      setLoadingCompatibility(false)
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        const threshold = 100
        if (info.offset.x > threshold) {
          onSwipe('right')
        } else if (info.offset.x < -threshold) {
          onSwipe('left')
        }
      }}
      whileDrag={{ rotate: Math.random() * 10 - 5 }}
      className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing touch-pan-x"
    >
      {/* Large Profile Picture */}
      <div className="relative h-72 sm:h-80 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onLoad={() => console.log('SwipeCard: Profile image loaded successfully:', profile.avatar_url)}
            onError={(e) => {
              console.error('SwipeCard: Error loading profile image:', profile.avatar_url)
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-24 h-24 text-white opacity-60" />
          </div>
        )}
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Profile info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center mb-2">
            <h2 className="text-3xl font-bold">{profile.name}</h2>
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{profile.age} anos</span>
          </div>
          
          {/* Compatibility Badge */}
          {showCompatibility && compatibility && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 bg-black bg-opacity-50 backdrop-blur-sm rounded-full px-3 py-1 mt-2"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className={`text-sm font-medium ${getCompatibilityColor(compatibility.overallScore)}`}>
                {Math.round(compatibility.overallScore * 100)}% compatível
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bio Section - moved to top */}
      {profile.bio && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <Quote className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Sobre</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Location Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">Localização</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCountryFlag(profile.country)}</span>
            <span className="text-lg font-medium text-gray-800">{getCountryName(profile.country)}</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-600" />
            <span className="text-lg text-gray-700">
              {profile.city}{stateAbbr ? `, ${stateAbbr}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Rank */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-800">Elo Atual</h3>
        </div>
        <div className="flex items-center space-x-3 mt-3">
          <img
            src={getRankImageUrl(profile.current_rank)}
            alt={profile.current_rank}
            className="w-12 h-12"
          />
          <span className="text-xl font-bold text-gray-800">{profile.current_rank}</span>
        </div>
        
        {/* Detailed Compatibility */}
        {showCompatibility && compatibility && !loadingCompatibility && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-1 text-blue-600" />
              Análise de Compatibilidade
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Linhas:</span>
                <span className={`font-medium ${getCompatibilityColor(compatibility.lineCompatibility)}`}>
                  {Math.round(compatibility.lineCompatibility * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heróis:</span>
                <span className={`font-medium ${getCompatibilityColor(compatibility.heroSynergy)}`}>
                  {Math.round(compatibility.heroSynergy * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Elo:</span>
                <span className={`font-medium ${getCompatibilityColor(compatibility.rankProximity)}`}>
                  {Math.round(compatibility.rankProximity * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Local:</span>
                <span className={`font-medium ${getCompatibilityColor(compatibility.locationProximity)}`}>
                  {Math.round(compatibility.locationProximity * 100)}%
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-800">Geral:</span>
                <span className={`text-sm font-bold ${getCompatibilityColor(compatibility.overallScore)}`}>
                  {getCompatibilityDescription(compatibility.overallScore)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {showCompatibility && loadingCompatibility && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <span className="text-xs text-gray-600">Calculando compatibilidade...</span>
          </div>
        )}
      </div>

      {/* Heroes */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Sword className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-800">Heróis Favoritos</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {profile.favorite_heroes.map((hero) => (
            <div key={hero} className="text-center">
              <img
                src={getHeroImageUrl(hero)}
                alt={hero}
                className="w-16 h-16 mx-auto rounded-lg mb-2"
              />
              <p className="text-xs font-medium text-gray-700 truncate">{hero}</p>
            </div>
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
            <div key={line} className="text-center">
              <img
                src={getLineImageUrl(line)}
                alt={line}
                className="w-12 h-12 mx-auto rounded-lg mb-2 bg-transparent"
              />
              <p className="text-xs font-medium text-gray-700 capitalize">{line}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Swipe Hint */}
      <div className="p-3 bg-gray-50 text-center">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 leading-tight">
            Arraste para a esquerda para passar • Arraste para a direita para curtir
          </p>
          {showCompatibility && (
            <p className="text-xs text-blue-600 font-medium">
              💎 Análise de compatibilidade ativa
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}