import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ProfileEditForm } from './ProfileEditForm'
import { FilterModal, FilterCriteria } from './FilterModal'
import { Edit2, MapPin, Calendar, Trophy, Sword, Target, Quote, ArrowLeft, User, AlertCircle, BadgeCheck, LogOut, Diamond, Wallet, X, MessageSquare, Settings } from 'lucide-react'
import { FileText } from 'lucide-react'
import { getHeroImageUrl, getRankImageUrl, getLineImageUrl } from '../constants/gameData'
import { RANKS, HEROES, LINES } from '../constants/gameData'
import { fetchAllLocations, getStateAbbrByCity } from '../utils/locationUtils'
import { getCountryFlag, getCountryName } from '../utils/countryUtils'
import DiamondPurchase from './DiamondPurchase'
import { TermsOfUse } from './TermsOfUse'

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
  created_at: string
  avatar_url: string | null
  diamond_count: number
  is_premium: boolean
  min_age_filter?: number
  max_age_filter?: number
  selected_ranks_filter?: string[]
  selected_states_filter?: string[]
  selected_cities_filter?: string[]
  selected_lanes_filter?: string[]
  selected_heroes_filter?: string[]
  compatibility_mode_filter?: boolean
}

interface ProfileViewProps {
  profileId?: string
  onBack?: () => void
  onGoToPremium?: () => void
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profileId, onBack, onGoToPremium }) => {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showDiamondPurchase, setShowDiamondPurchase] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [stateAbbr, setStateAbbr] = useState<string | null>(null)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [withdrawalStep, setWithdrawalStep] = useState(1) // 1: amount, 2: ML credentials
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [mlUserId, setMlUserId] = useState('')
  const [mlZoneId, setMlZoneId] = useState('')
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false)
  
  // Filter modal states
  const [currentFilters, setCurrentFilters] = useState<FilterCriteria>({
    minAge: 18,
    maxAge: 35,
    selectedRanks: [],
    selectedStates: [],
    selectedCities: [],
    selectedLanes: [],
    selectedHeroes: [],
    compatibilityMode: true
  })
  const [allRanksData, setAllRanksData] = useState<Array<{ id: string; name: string; color?: string }>>([])
  const [allLocationsData, setAllLocationsData] = useState<Array<{ id: string; name: string; state_abbr: string; region: string }>>([])
  const [allLanesData, setAllLanesData] = useState<Array<{ id: string; name: string; color?: string }>>([])
  const [allHeroesData, setAllHeroesData] = useState<Array<{ id: string; name: string; role?: string }>>([])
  const [filtersSaving, setFiltersSaving] = useState(false)

  // Opções de saque disponíveis
  const withdrawalOptions = [165, 275, 565]

  useEffect(() => {
    fetchProfile()
    loadGameDataForFilters()
  }, [user, profileId])

  useEffect(() => {
    if (profile?.city) {
      fetchStateAbbr()
    }
  }, [profile?.city])

  const fetchStateAbbr = async () => {
    if (!profile?.city) return
    
    try {
      const abbr = await getStateAbbrByCity(profile.city, profile.country)
      setStateAbbr(abbr)
    } catch (error) {
      console.error('Error fetching state abbreviation:', error)
      setStateAbbr(null)
    }
  }

  const loadGameDataForFilters = async () => {
    try {
      // Load ranks
      const ranksData = RANKS.map(rank => ({ id: rank, name: rank }))
      setAllRanksData(ranksData)
      
      // Load heroes
      const heroesData = HEROES.map(hero => ({ id: hero, name: hero }))
      setAllHeroesData(heroesData)
      
      // Load lanes
      const lanesData = LINES.map(line => ({ id: line, name: line }))
      setAllLanesData(lanesData)
      
      // Load locations
      const locationsData = await fetchAllLocations('BR') // Por enquanto, manter apenas Brasil para filtros
      setAllLocationsData(locationsData)
    } catch (error) {
      console.error('Error loading game data for filters:', error)
    }
  }

  const fetchProfile = async () => {
    if (!user) return

    const targetUserId = profileId || user.id

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, diamond_count, is_premium, min_age_filter, max_age_filter, selected_ranks_filter, selected_states_filter, selected_cities_filter, selected_lanes_filter, selected_heroes_filter, compatibility_mode_filter')
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
      
      // Update current filters with profile data
      if (data && isOwnProfile) {
        setCurrentFilters({
          minAge: data.min_age_filter || 18,
          maxAge: data.max_age_filter || 35,
          selectedRanks: data.selected_ranks_filter || [],
          selectedStates: data.selected_states_filter || [],
          selectedCities: data.selected_cities_filter || [],
          selectedLanes: data.selected_lanes_filter || [],
          selectedHeroes: data.selected_heroes_filter || [],
          compatibilityMode: data.compatibility_mode_filter ?? true
        })
      }
      
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

  const handleApplyFilters = async () => {
    if (!user || !isOwnProfile) return
    
    console.log('ProfileView: Applying filters', currentFilters)
    setFiltersSaving(true)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          min_age_filter: currentFilters.minAge,
          max_age_filter: currentFilters.maxAge,
          selected_ranks_filter: currentFilters.selectedRanks,
          selected_states_filter: currentFilters.selectedStates,
          selected_cities_filter: currentFilters.selectedCities,
          selected_lanes_filter: currentFilters.selectedLanes,
          selected_heroes_filter: currentFilters.selectedHeroes,
          compatibility_mode_filter: currentFilters.compatibilityMode,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (error) {
        console.error('ProfileView: Error updating filters', error)
        throw error
      }
      
      console.log('ProfileView: Filters updated successfully')
      setShowFilterModal(false)
      fetchProfile() // Refresh profile data
      
    } catch (error) {
      console.error('Error updating filters:', error)
      alert('Erro ao salvar filtros. Tente novamente.')
    } finally {
      setFiltersSaving(false)
    }
  }

  const handleCloseFilterModal = () => {
    setShowFilterModal(false)
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
    if (!selectedAmount || !mlUserId.trim() || !mlZoneId.trim()) {
      alert('Por favor, preencha todos os dados necessários.')
      return
    }
    
    submitWithdrawalRequest()
  }

  const submitWithdrawalRequest = async () => {
    if (!user || !selectedAmount || !mlUserId.trim() || !mlZoneId.trim()) return

    setSubmittingWithdrawal(true)
    try {
      // Save ML data to user's profile for future use
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ml_user_id: mlUserId.trim(),
          ml_zone_id: mlZoneId.trim()
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('Error updating profile with ML data:', profileError)
        // Continue even if profile update fails, main transaction is more important
      }

      // Call the Supabase RPC function to process the withdrawal
      console.log('ProfileView: Calling process_diamond_withdrawal RPC function...')
      const { data: rpcResult, error: rpcError } = await supabase.rpc('process_diamond_withdrawal', {
        p_user_id: user.id,
        p_amount: selectedAmount,
        p_ml_user_id: mlUserId.trim(),
        p_ml_zone_id: mlZoneId.trim()
      })

      console.log('ProfileView: RPC result:', { rpcResult, rpcError })

      if (rpcError) {
        console.error('ProfileView: Error calling RPC function:', rpcError)
        throw new Error(`Erro no saque: ${rpcError.message}`)
      }

      if (!rpcResult.success) {
        console.error('ProfileView: Withdrawal failed via RPC:', rpcResult?.error)
        throw new Error(rpcResult.error || 'Falha ao processar saque de diamantes')
      }

      console.log('ProfileView: Withdrawal processed successfully!', {
        withdrawalId: rpcResult.withdrawal_id,
        transactionId: rpcResult.transaction_id,
        newDiamondCount: rpcResult.new_diamond_count
      })

      // Update local profile state with new diamond count
      setProfile(prevProfile => 
        prevProfile 
          ? { ...prevProfile, diamond_count: rpcResult.new_diamond_count }
          : null
      )
      
      // Close modal and reset form
      setShowWithdrawalModal(false)
      setWithdrawalStep(1)
      setSelectedAmount(null)
      setMlUserId('')
      setMlZoneId('')
      
      alert('✅ Solicitação de saque enviada e diamantes deduzidos! Você será contatado em breve.')
      
    } catch (error) {
      console.error('Error in withdrawal process:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro no processo de saque: ${errorMessage}`)
    } finally {
      setSubmittingWithdrawal(false)
    }
  }

  const handleCloseWithdrawalModal = () => {
    setShowWithdrawalModal(false)
    setWithdrawalStep(1)
    setSelectedAmount(null)
    setMlUserId('')
    setMlZoneId('')
  }

  const handleNextStep = () => {
    if (withdrawalStep === 1 && selectedAmount) {
      // Carregar dados ML salvos se existirem
      if (profile?.ml_user_id) setMlUserId(profile.ml_user_id)
      if (profile?.ml_zone_id) setMlZoneId(profile.ml_zone_id)
      setWithdrawalStep(2)
    }
  }

  const handlePreviousStep = () => {
    if (withdrawalStep === 2) {
      setWithdrawalStep(1)
    }
  }

  const getWithdrawalModalContent = () => {
    const whatsappNumber = '5545988349638'
    if (withdrawalStep === 1) {
      return (
        <>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💎</span>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Sacar Diamantes</h3>
            
            <div className="bg-yellow-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">💎</span>
                <span className="text-2xl font-bold text-gray-800">{profile?.diamond_count}</span>
                <span className="text-gray-600">disponíveis</span>
              </div>
            </div>
            
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Escolha a quantidade para saque:</h4>
            
            <div className="space-y-3 mb-6">
              {withdrawalOptions.map((amount) => {
                const canWithdraw = (profile?.diamond_count || 0) >= amount
                const remaining = (profile?.diamond_count || 0) - amount
                
                return (
                  <motion.button
                    key={amount}
                    whileHover={canWithdraw ? { scale: 1.02 } : {}}
                    whileTap={canWithdraw ? { scale: 0.98 } : {}}
                    onClick={() => canWithdraw && setSelectedAmount(amount)}
                    disabled={!canWithdraw}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedAmount === amount
                        ? 'border-yellow-500 bg-yellow-50'
                        : canWithdraw
                        ? 'border-gray-300 hover:border-yellow-400 bg-white'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">💎</span>
                        <div className="text-left">
                          <div className="text-lg font-bold text-gray-800">{amount} diamantes</div>
                          {canWithdraw && (
                            <div className="text-sm text-gray-600">
                              Restará: {remaining} diamantes
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedAmount === amount && (
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-blue-800 mb-2">
                <span className="text-lg">⏰</span>
                <span className="text-sm font-medium">Prazo de processamento:</span>
              </div>
              <p className="text-sm text-blue-700">Até 4 horas após aprovação da troca</p>
            </div>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNextStep}
                disabled={!selectedAmount}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </motion.button>
              
              <button
                onClick={handleCloseWithdrawalModal}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )
    }

    // Step 2: ML Credentials
    return (
      <>
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎮</span>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Dados do Mobile Legends</h3>
          <p className="text-gray-600 mb-6">
            Sacando {selectedAmount} diamantes
          </p>
          
          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
              <span className="text-lg mr-2">📱</span>
              Como encontrar seus dados:
            </h4>
            <div className="text-xs text-blue-700 space-y-2">
              <div className="flex items-start space-x-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Abra o Mobile Legends</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Toque no seu avatar (canto superior esquerdo)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>Copie seu ID de Usuário e ID de Zona</span>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-white rounded-lg border border-blue-200">
              <img
                src="https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imgelo/imgi_20_tip.jpg"
                alt="Como encontrar ID no Mobile Legends"
                className="w-full h-auto rounded"
              />
            </div>
          </div>
          
          {/* Input fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                ID de Usuário *
              </label>
              <input
                type="text"
                value={mlUserId}
                onChange={(e) => setMlUserId(e.target.value)}
                placeholder="Ex: 123456789"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-lg"
                maxLength={12}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                ID de Zona *
              </label>
              <input
                type="text"
                value={mlZoneId}
                onChange={(e) => setMlZoneId(e.target.value)}
                placeholder="Ex: 1234"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-lg"
                maxLength={6}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWithdrawal}
              disabled={!mlUserId.trim() || !mlZoneId.trim() || submittingWithdrawal}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submittingWithdrawal ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Diamond className="w-5 h-5" />
                  <span>Solicitar Saque</span>
                </>
              )}
            </motion.button>
            
            <button
              onClick={handlePreviousStep}
              disabled={submittingWithdrawal}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Voltar
            </button>
          </div>
        </div>
      </>
    )
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 overflow-x-hidden">
      <div className="max-w-md mx-auto pb-20 px-4">
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
          <div className="relative h-80 sm:h-96 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
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
                <div className="flex items-center justify-center text-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">{profile.age} anos</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Location Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 border-b border-gray-200"
          >
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
          </motion.div>

          {/* Bio Section */}
          {profile.bio && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 border-b border-gray-200"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Quote className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Sobre</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-base">{profile.bio}</p>
            </motion.div>
          )}

          {/* Rank Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
              transition={{ delay: 0.6 }}
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
            transition={{ delay: 0.7 }}
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
                    className="w-20 h-20 mx-auto rounded-xl mb-2"
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
            transition={{ delay: 0.8 }}
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
                    className="w-16 h-16 mx-auto rounded-xl mb-2 bg-transparent"
                  />
                  <p className="text-sm font-medium text-gray-700 capitalize">{line}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

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
                {/* Filter button - show for all users */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilterModal(true)}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all mb-3"
                >
                  <Settings className="w-5 h-5" />
                  <span>Alterar Filtros</span>
                </motion.button>
                
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
                  onClick={() => setShowTermsModal(true)}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all mb-3"
                >
                  <FileText className="w-5 h-5" />
                  <span>Termos de Uso</span>
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
           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
             className="bg-white rounded-2xl p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto my-auto"
            >
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {getWithdrawalModalContent()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={handleCloseFilterModal}
        filters={currentFilters}
        onFiltersChange={setCurrentFilters}
        onApplyFilters={handleApplyFilters}
        isSaving={filtersSaving}
        isPremium={profile?.is_premium || false}
        onGoToPremium={onGoToPremium}
        ranks={allRanksData}
        locations={allLocationsData}
        lanes={allLanesData}
        heroes={allHeroesData}
      />

      {/* Terms of Use Modal */}
      <TermsOfUse
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  )
}