import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ProfileEditForm } from './ProfileEditForm'
import { Edit2, MapPin, Calendar, Trophy, Sword, Target, Quote, ArrowLeft, User, AlertCircle, BadgeCheck, LogOut, Diamond, Wallet, X, MessageSquare } from 'lucide-react'
import { getHeroImageUrl, getRankImageUrl, getLineImageUrl } from '../constants/gameData'
import { DiamondPurchase } from './DiamondPurchase'

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
  avatar_url: string | null
  diamond_count: number
  is_premium: boolean
}

interface ProfileViewProps {
  profileId?: string
  onBack?: () => void
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profileId, onBack }) => {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showDiamondPurchase, setShowDiamondPurchase] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [user, profileId])

  const fetchProfile = async () => {
    if (!user) return

    const targetUserId = profileId || user.id

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, diamond_count, is_premium')
        .eq('id', targetUserId)
        .maybeSingle()

      if (error) {
        console.error('ProfileView: Error fetching profile', error)
        throw error
      }
      
      console.log('ProfileView: Profile data fetched:', {
        id: data?.id,
        name: data?.name,
        avatar_url: data?.avatar_url,
        hasAvatarUrl: !!data?.avatar_url,
        avatarUrlLength: data?.avatar_url?.length,
        avatarUrlStartsWith: data?.avatar_url?.substring(0, 50)
      })
      
      setProfile(data)
      setImageError(false)
      setImageLoading(true)
      
      // Enhanced debugging for avatar URL
      if (data?.avatar_url) {
        const debugData = {
          url: data.avatar_url,
          isValidUrl: data.avatar_url.startsWith('http'),
          containsSupabase: data.avatar_url.includes('supabase'),
          containsAvatars: data.avatar_url.includes('avatars'),
          containsToken: data.avatar_url.includes('token='),
          urlLength: data.avatar_url.length
        }
        setDebugInfo(debugData)
        console.log('ProfileView: Avatar URL debug info:', debugData)
        
        // Test URL accessibility
        testUrlAccessibility(data.avatar_url)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const testUrlAccessibility = async (url: string) => {
    try {
      console.log('ProfileView: Testing URL accessibility:', url)
      
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors'
      })
      
      console.log('ProfileView: URL accessibility test result:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (!response.ok) {
        console.error('ProfileView: URL is not accessible:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('ProfileView: URL accessibility test failed:', error)
    }
  }

  const handleSaveProfile = () => {
    setIsEditing(false)
    fetchProfile()
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    if (isSigningOut) return
    
    setIsSigningOut(true)
    console.log('ProfileView: Starting sign out process')
    
    try {
      await signOut()
      console.log('ProfileView: Sign out completed')
    } catch (error) {
      console.error('ProfileView: Sign out failed', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleWithdrawal = () => {
    const whatsappNumber = '5545988349638'
    const message = encodeURIComponent(`Olá! Gostaria de sacar ${profile?.diamond_count} diamantes da minha conta no ML Duo. Pode me ajudar?`)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
    setShowWithdrawalModal(false)
  }
  const handleImageLoad = () => {
    console.log('ProfileView: Image loaded successfully:', profile?.avatar_url)
    setImageError(false)
    setImageLoading(false)
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('ProfileView: Error loading profile image:', profile?.avatar_url)
    console.error('ProfileView: Image error event:', e)
    
    const img = e.currentTarget
    console.error('ProfileView: Image error details:', {
      src: img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
      currentSrc: img.currentSrc
    })
    
    setImageError(true)
    setImageLoading(false)
  }

  const isOwnProfile = !profileId || profileId === user?.id

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

  if (isEditing && profile) {
    return (
      <ProfileEditForm
        initialProfile={profile}
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
      />
    )
  }

  if (showDiamondPurchase) {
    return (
      <DiamondPurchase
        onBack={() => setShowDiamondPurchase(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      <div className="max-w-md mx-auto pb-20">
        {/* Header with back button */}
        <div className="relative z-20 p-4 pt-8">
          <div className="flex items-center justify-between">
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="p-3 bg-black bg-opacity-30 backdrop-blur-sm rounded-full hover:bg-opacity-40 transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden -mt-4">
          {/* Large Profile Image Section */}
          <div className="relative h-96 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
            {profile.avatar_url && !imageError ? (
              <div className="relative w-full h-full">
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <User className="w-24 h-24 text-white opacity-60 mb-4" />
                
                {/* Debug information for development */}
                {imageError && profile.avatar_url && debugInfo && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-80 text-white text-xs p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
                      <span className="font-semibold">Erro ao carregar imagem</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div>URL válida: {debugInfo.isValidUrl ? '✓' : '✗'}</div>
                      <div>Contém Supabase: {debugInfo.containsSupabase ? '✓' : '✗'}</div>
                      <div>Contém token: {debugInfo.containsToken ? '⚠️' : '✓'}</div>
                      <div className="break-all">URL: {debugInfo.url.substring(0, 60)}...</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Profile info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <h1 className="text-4xl font-bold drop-shadow-lg">{profile.name}</h1>
                  {profile.is_premium && (
                    <BadgeCheck className="w-8 h-8 text-blue-400 ml-2 drop-shadow-lg" />
                  )}
                </div>
                <div className="flex items-center space-x-6 text-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">{profile.age} anos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">{profile.city}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Rank Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 border-b border-gray-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <h3 className="text-xl font-bold text-gray-800">Elo Atual</h3>
            </div>
            <div className="flex items-center space-x-4">
              <img
                src={getRankImageUrl(profile.current_rank)}
                alt={profile.current_rank}
                className="w-16 h-16"
              />
              <span className="text-2xl font-bold text-gray-800">{profile.current_rank}</span>
            </div>
          </motion.div>

          {/* Diamonds Section - Only show on own profile */}
          {isOwnProfile && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💎</span>
                  <h3 className="text-xl font-bold text-gray-800">Seus Diamantes</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl">💎</span>
                  <span className="text-3xl font-bold text-gray-800">{profile.diamond_count || 0}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-600 text-sm">
                  Converta seus diamantes em diamantes do Mobile Legends!
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowWithdrawalModal(true)}
                  disabled={!profile.diamond_count || profile.diamond_count < 165}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    profile.diamond_count >= 165
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span>Sacar Diamantes</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDiamondPurchase(true)}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <span className="text-lg">💎</span>
                  <span>Comprar Diamantes</span>
                </motion.button>
                
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-yellow-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Saque mínimo: 165 diamantes</span>
                  </div>
                  {profile.diamond_count < 165 && (
                    <p className="text-xs text-yellow-700 mt-1">
                      Você precisa de mais {165 - profile.diamond_count} diamantes para sacar
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Heroes Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 border-b border-gray-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Sword className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold text-gray-800">Heróis Favoritos</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {profile.favorite_heroes.map((hero, index) => (
                <motion.div
                  key={hero}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <img
                    src={getHeroImageUrl(hero)}
                    alt={hero}
                    className="w-20 h-20 mx-auto rounded-xl shadow-lg mb-2"
                  />
                  <p className="text-sm font-medium text-gray-700 truncate">{hero}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Lines Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 border-b border-gray-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-800">Linhas Favoritas</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {profile.favorite_lines.map((line, index) => (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <img
                    src={getLineImageUrl(line)}
                    alt={line}
                    className="w-16 h-16 mx-auto rounded-xl shadow-lg mb-2 bg-transparent"
                  />
                  <p className="text-sm font-medium text-gray-700 capitalize">{line}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bio Section */}
          {profile.bio && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="p-6 border-b border-gray-200"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Quote className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Sobre</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-base">{profile.bio}</p>
            </motion.div>
          )}

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="p-6 bg-gray-50 space-y-4"
          >
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            {/* Logout button - only show on own profile */}
            {isOwnProfile && (
              <div className="pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all mb-3"
                >
                  <Edit2 className="w-5 h-5" />
                  <span>Editar Perfil</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const whatsappNumber = '5545988349638'
                    const message = encodeURIComponent('Olá! Preciso de ajuda com o ML Duo. Pode me ajudar?')
                    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all mb-3"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Suporte WhatsApp</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{isSigningOut ? 'Saindo...' : 'Sair da Conta'}</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawalModal && (
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
              className="bg-white rounded-2xl p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">💎</span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Sacar Diamantes</h3>
                <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-2xl">💎</span>
                    <span className="text-2xl font-bold text-gray-800">{profile?.diamond_count}</span>
                    <span className="text-gray-600">diamantes</span>
                  </div>
                  <p className="text-sm text-gray-600">Disponíveis para saque</p>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Para sacar seus diamantes e convertê-los em diamantes do Mobile Legends, 
                  entre em contato com nosso desenvolvedor via WhatsApp.
                </p>
                
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWithdrawal}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-3"
                  >
                    <MessageSquare className="w-6 h-6" />
                    <span>Chamar no WhatsApp</span>
                  </motion.button>
                  
                  <button
                    onClick={() => setShowWithdrawalModal(false)}
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center justify-center space-x-2 text-blue-800 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Informações importantes:</span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>• Saque mínimo: 165 diamantes</p>
                    <p>• Conversão 1:1 para diamantes ML</p>
                    <p>• Processamento em até 24h</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}