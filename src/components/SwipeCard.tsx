import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Trophy, Sword, Target, Quote, User, BadgeCheck } from 'lucide-react'
import { getHeroImageUrl, getRankImageUrl, getLineImageUrl } from '../constants/gameData'
import { getStateAbbrByCity } from '../utils/locationUtils'

interface Profile {
  id: string
  name: string
  age: number
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
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe }) => {
  const [stateAbbr, setStateAbbr] = useState<string | null>(null)

  useEffect(() => {
    const fetchStateAbbr = async () => {
      if (profile.city) {
        try {
          const abbr = await getStateAbbrByCity(profile.city)
          setStateAbbr(abbr)
        } catch (error) {
          console.error('Error fetching state abbreviation:', error)
          setStateAbbr(null)
        }
      }
    }

    fetchStateAbbr()
  }, [profile.city])

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
      className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Large Profile Picture */}
      <div className="relative h-80 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
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
            {profile.is_premium && (
              <BadgeCheck className="w-6 h-6 text-blue-400 ml-2 drop-shadow-lg" />
            )}
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{profile.age} anos</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">
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
                className="w-16 h-16 mx-auto rounded-lg shadow-md mb-2"
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
                className="w-12 h-12 mx-auto rounded-lg shadow-md mb-2 bg-transparent"
              />
              <p className="text-xs font-medium text-gray-700 capitalize">{line}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Quote className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Sobre</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Swipe Hint */}
      <div className="p-4 bg-gray-50 text-center">
        <p className="text-xs text-gray-500">
          Arraste para a esquerda para passar • Arraste para a direita para curtir
        </p>
      </div>
    </motion.div>
  )
}