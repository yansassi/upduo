import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Trophy, Sword, Target, Quote } from 'lucide-react'
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
}

interface SwipeCardProps {
  profile: Profile
  onSwipe: (direction: 'left' | 'right') => void
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe }) => {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) {
          onSwipe('right')
        } else if (info.offset.x < -100) {
          onSwipe('left')
        }
      }}
      whileDrag={{ rotate: Math.random() * 10 - 5 }}
      className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
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
                className="w-12 h-12 mx-auto rounded-lg shadow-md mb-2"
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