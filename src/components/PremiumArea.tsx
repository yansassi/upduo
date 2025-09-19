import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Crown, Sparkles, Heart, Zap, Check, X, User, Mail, Phone, CreditCard, Star, Users, Filter, ArrowLeft, Eye, BadgeCheck, Diamond } from 'lucide-react'
import { getRankImageUrl } from '../constants/gameData'
import { CaktoPayment } from './CaktoPayment'

interface PremiumAreaProps {
  onUpgrade?: () => void
}

interface FormData {
  name: string
  email: string
  phone: string
}

interface LikedByProfile {
  id: string
  name: string
  current_rank: string
  avatar_url: string | null
  is_premium: boolean
}

export default function PremiumArea({ onUpgrade }: PremiumAreaProps) {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: ''
  })
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({})
  const [loading, setLoading] = useState(false)

  const [likedByProfiles, setLikedByProfiles] = useState<LikedByProfile[]>([])
  const [loadingLikedBy, setLoadingLikedBy] = useState(false)
  const [likedByError, setLikedByError] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState('')

  const PREMIUM_PRICE = 25.00 // R$ 25,00

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  useEffect(() => {
    if (user && userProfile?.is_premium) {
      fetchLikedByProfiles()
    }
  }, [user, userProfile?.is_premium])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
    }
  }

  const fetchLikedByProfiles = async () => {
    if (!user || !userProfile?.is_premium) return

    console.log('PremiumArea: Fetching profiles that liked user', user.id)
    setLoadingLikedBy(true)
    setLikedByError(null)

    try {
      // First, get all profiles that the current user has already swiped on (liked OR disliked)
      const { data: userLikesData, error: userLikesError } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id)

      if (userLikesError) {
        console.error('PremiumArea: Error fetching user swipes', userLikesError)
        throw userLikesError
      }

      console.log('PremiumArea: User swipes data', { userLikesData })

      // Get all users that the current user has matched with
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

      if (matchesError) {
        console.error('PremiumArea: Error fetching matches', matchesError)
        throw matchesError
      }

      console.log('PremiumArea: Matches data', { matchesData })

      // Create array of excluded user IDs (users already swiped on or matched)
      const excludedIds = new Set<string>()
      
      // Add users that current user has already swiped on (liked OR disliked)
      userLikesData?.forEach(like => {
        excludedIds.add(like.swiped_id)
      })
      
      // Add users that current user has matched with
      matchesData?.forEach(match => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id
        excludedIds.add(otherUserId)
      })

      const excludedIdsArray = Array.from(excludedIds)
      console.log('PremiumArea: Excluded user IDs', { excludedIdsArray, count: excludedIdsArray.length })

      // Get all swipes where someone liked the current user (excluding users already swiped on or matched)
      let swipesQuery = supabase
        .from('swipes')
        .select('swiper_id')
        .eq('swiped_id', user.id)
        .eq('is_like', true)

      // Exclude users that current user has already swiped on or matched with
      if (excludedIdsArray.length > 0) {
        swipesQuery = swipesQuery.not('swiper_id', 'in', `(${excludedIdsArray.join(',')})`)
      }

      const { data: swipesData, error: swipesError } = await swipesQuery

      console.log('PremiumArea: Swipes data', { swipesData, swipesError })

      if (swipesError) {
        throw swipesError
      }

      if (!swipesData || swipesData.length === 0) {
        console.log('PremiumArea: No new likes found (excluding already swiped/matched users)')
        setLikedByProfiles([])
        return
      }

      // Get the swiper IDs
      const swiperIds = swipesData.map(swipe => swipe.swiper_id)
      console.log('PremiumArea: Swiper IDs that liked user (excluding already swiped/matched)', swiperIds)

      // Now get the profiles of those users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, current_rank, avatar_url, is_premium')
        .in('id', swiperIds)
        .order('name')

      console.log('PremiumArea: Profiles data', { profilesData, profilesError })

      if (profilesError) {
        throw profilesError
      }

      setLikedByProfiles(profilesData || [])
    } catch (error) {
      console.error('PremiumArea: Error fetching liked by profiles', error)
      setLikedByError(error instanceof Error ? error.message : 'Erro ao carregar perfis')
    } finally {
      setLoadingLikedBy(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Telefone é obrigatório'
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.phone)) {
      errors.phone = 'Telefone inválido (use formato: (11) 99999-9999)'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const formatPhone = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '')
    return cleanValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue = value

    if (field === 'phone') {
      formattedValue = formatPhone(value)
    } else if (field === 'name') {
      // Permitir apenas letras, espaços e acentos
      formattedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 50)
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }))

    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    savePremiumSignupData()
  }

  const savePremiumSignupData = async () => {
    if (!user) {
      alert('Erro: Usuário não autenticado')
      return
    }

    setLoading(true)
    try {
      console.log('PremiumArea: Saving premium signup data', {
        userId: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, '') // Remove formatting
      })

      // Save the premium signup data to the database
      const { data, error } = await supabase
        .from('premium_signups')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.replace(/\D/g, '') // Store clean phone number
        })
        .select()

      console.log('PremiumArea: Premium signup data save result', { data, error })

      if (error) {
        console.error('PremiumArea: Error saving premium signup data', error)
        throw error
      }

      console.log('PremiumArea: Premium signup data saved successfully')
      
      // Set the checkout URL for Premium payment and proceed to checkout
      setCheckoutUrl('https://pay.cakto.com.br/8bg52uh_478091')
      setShowCheckout(true)

    } catch (error) {
      console.error('Error saving premium signup data:', error)
      
      let errorMessage = 'Erro ao salvar dados. Tente novamente.'
      
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as any
        if (supabaseError.code === '23505') {
          errorMessage = 'Você já possui um registro de assinatura premium.'
        } else if (supabaseError.code === '23503') {
          errorMessage = 'Erro de referência de usuário. Tente fazer login novamente.'
        }
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToForm = () => {
    setShowCheckout(false)
  }

  const handleStartPremium = () => {
    setShowForm(true)
  }

  const premiumFeatures = [
    {
      icon: <Diamond className="w-6 h-6" />,
      title: "Receba 30 Diamantes",
      description: "Ganhe 30 diamantes de bônus ao assinar Premium"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "50 Swipes por Dia",
      description: "50 swipes por dia (vs 20 gratuitos)"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Desfazer Swipes",
      description: "Mudou de ideia? Desfaça seu último swipe"
    },
    {
      icon: <Filter className="w-6 h-6" />,
      title: "Filtros Avançados",
      description: "Encontre jogadores por elo, cidade, heróis e mais"
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: "Badge Premium",
      description: "Destaque-se com o badge verificado"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Prioridade nos Matches",
      description: "Apareça primeiro para outros jogadores"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Algoritmo de Compatibilidade",
      description: "IA que encontra os melhores duos para você"
    }
  ]

  // Se o usuário já é premium
  if (userProfile?.is_premium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-800 to-red-900 p-4">
        <div className="max-w-md mx-auto pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Você é Premium!</h1>
            <p className="text-gray-600 mb-6">
              Aproveite todos os recursos exclusivos do UpDuo Premium
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex flex-col items-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-yellow-600 mb-2">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-xs text-center text-gray-800">{feature.title}</h3>
                </div>
              ))}
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-green-800">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Status: Ativo</span>
              </div>
            </div>

            {/* Quem te Curtiu Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Quem te Curtiu</h3>
                  <p className="text-gray-600 text-sm">Veja quem deu like no seu perfil</p>
                </div>
              </div>

              {loadingLikedBy && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando perfis...</p>
                </div>
              )}

              {likedByError && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-red-600 mb-4">{likedByError}</p>
                  <button
                    onClick={fetchLikedByProfiles}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}

              {!loadingLikedBy && !likedByError && likedByProfiles.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Ninguém curtiu seu perfil ainda</p>
                  <p className="text-gray-500 text-sm mt-2">Continue usando o app para encontrar matches!</p>
                </div>
              )}

              {!loadingLikedBy && !likedByError && likedByProfiles.length > 0 && (
                <div className="space-y-4">
                  <p className="text-gray-700 font-medium">
                    {likedByProfiles.length} pessoa{likedByProfiles.length > 1 ? 's' : ''} curtiu{likedByProfiles.length > 1 ? 'ram' : ''} você:
                  </p>
                  
                  <div className="grid gap-4">
                    {likedByProfiles.map((profile) => (
                      <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <User className="w-8 h-8 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-lg font-semibold text-gray-800 truncate">{profile.name}</h4>
                            {profile.is_premium && (
                              <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <img
                              src={getRankImageUrl(profile.current_rank)}
                              alt={profile.current_rank}
                              className="w-5 h-5 flex-shrink-0"
                            />
                            <span className="text-sm text-gray-600 font-medium">{profile.current_rank}</span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-pink-500" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 p-4">
      <div className="max-w-md mx-auto pt-8 pb-20">
        <AnimatePresence mode="wait">
          {!showForm ? (
            // Tela inicial do Premium
            <motion.div
              key="premium-intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <Crown className="w-12 h-12 text-white" />
                </motion.div>
                
                <h1 className="text-4xl font-bold text-white mb-3">UpDuo Premium</h1>
                <p className="text-purple-200 text-lg">
                  Desbloqueie todo o potencial do app
                </p>
              </div>

              {/* Preço */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 text-center shadow-xl"
              >
                <div className="text-6xl font-bold text-gray-800 mb-2">R$ 25</div>
                <div className="text-gray-600 text-lg">por mês</div>
                <div className="text-sm text-green-600 font-medium mt-2">
                  💎 Melhor custo-benefício
                </div>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6"
              >
                <h3 className="text-white font-bold text-xl mb-4 text-center">
                  O que você ganha:
                </h3>
                
                <div className="space-y-4">
                  {premiumFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-3 text-white"
                    >
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{feature.title}</h4>
                        <p className="text-purple-200 text-sm">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartPremium}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center space-x-2"
              >
                <Crown className="w-5 h-5" />
                <span>Assinar Premium</span>
              </motion.button>

              {/* Garantia */}
              <div className="text-center">
                <p className="text-purple-200 text-sm">
                  ✅ Pagamento 100% seguro via PIX
                </p>
              </div>
            </motion.div>
          ) : !showCheckout ? (
            // Formulário de dados
            <motion.div
              key="premium-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-2xl p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Assinar Premium</h3>
                    <p className="text-sm text-gray-600">R$ 25,00/mês</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      maxLength={50}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone (WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Benefícios */}
                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    ✨ Benefícios Premium:
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Receba 30 diamantes de bônus</li>
                    <li>• 50 swipes por dia (vs 20 gratuitos)</li>
                    <li>• Filtros avançados de busca</li>
                    <li>• Badge verificado no perfil</li>
                    <li>• Desfazer último swipe</li>
                    <li>• Prioridade nos matches</li>
                    <li>• Ver quem te curtiu</li>
                    <li>• Algoritmo de compatibilidade IA</li>
                  </ul>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar R$ 25</span>
                  </button>
                </div>
              </form>

              {/* Security Notice */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 text-green-800">
                  <span className="text-sm">🔒</span>
                  <span className="text-xs font-medium">
                    Seus dados estão seguros e protegidos
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            // Checkout integrado
            <motion.div
              key="checkout-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button
                  onClick={handleBackToForm}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Voltar</span>
                </button>
                
                <div className="text-center">
                  <h3 className="font-bold text-gray-800">Pagamento</h3>
                  <p className="text-sm text-gray-600">R$ 25,00</p>
                </div>
                
                <div className="w-16"></div> {/* Spacer */}
              </div>

              {/* Checkout iframe */}
              <div className="relative" style={{ height: 'min(70vh, 500px)', maxHeight: '70vh' }}>
                <iframe
                  src="https://pay.cakto.com.br/8bg52uh_478091"
                  className="w-full h-full border-0 overflow-auto"
                  title="Checkout Premium"
                  allow="payment"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                />
              </div>

              {/* Info */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">
                    🔒 Pagamento processado de forma segura
                  </p>
                  <p className="text-xs text-gray-500">
                    Após o pagamento, seu acesso Premium será ativado automaticamente
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cakto Payment Modal */}
      </div>
    </div>
  )
}