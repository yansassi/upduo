import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { DailyTasks } from './DailyTasks'
import { 
  Gift, 
  Calendar, 
  Trophy, 
  Users, 
  Instagram, 
  Sparkles, 
  Clock,
  CheckCircle,
  Star,
  Crown,
  PartyPopper,
  ArrowLeft,
  Plus,
  Zap
} from 'lucide-react'

interface InaugurationEventProps {
  onBack?: () => void
}

interface Winner {
  id: string
  user_id: string
  draw_date: string
  prize_amount: number
  awarded_at: string
  profile: {
    name: string
    is_premium: boolean
  }
}

interface ParticipationStats {
  totalParticipants: number
  userParticipated: boolean
  participatedAt: string | null
  userEntries: number
}

export const InaugurationEvent: React.FC<InaugurationEventProps> = ({ onBack }) => {
  const { user } = useAuth()
  
  // Control flag to enable/disable daily raffle
  const IS_DAILY_RAFFLE_ENABLED = false // Set to 'true' to re-enable
  
  const [loading, setLoading] = useState(true)
  const [participating, setParticipating] = useState(false)
  const [winners, setWinners] = useState<Winner[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [stats, setStats] = useState<ParticipationStats>({
    totalParticipants: 0,
    userParticipated: false,
    participatedAt: null,
    userEntries: 1
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [activeEventTab, setActiveEventTab] = useState<'tasks' | 'raffle'>(IS_DAILY_RAFFLE_ENABLED ? 'raffle' : 'tasks')

  // Event dates - 21 a 31 de julho de 2025
  const eventStartDate = new Date(2025, 6, 21) // Julho é mês 6 (0-indexed)
  const eventEndDate = new Date(2025, 6, 31)
  
  const currentDate = new Date()
  
  const isEventActive = currentDate >= eventStartDate && currentDate <= eventEndDate
  const eventDays = []
  
  // Generate event days (21 a 31 de julho)
  for (let day = 21; day <= 31; day++) {
    eventDays.push(day)
  }

  useEffect(() => {
    if (user) {
      fetchEventData()
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchEventData = async () => {
    if (!user) return

    try {
      // Fetch participation stats
      const { data: participationData, error: participationError } = await supabase
        .from('inauguration_participants')
        .select('participated_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (participationError && participationError.code !== 'PGRST116') {
        console.error('Error fetching participation:', participationError)
      }

      // Fetch total participants count
      const { count: totalCount, error: countError } = await supabase
        .from('inauguration_participants')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Error fetching participants count:', countError)
      }

      // Fetch winners
      const { data: winnersData, error: winnersError } = await supabase
        .from('daily_winners')
        .select(`
          *,
          profile:profiles(name, is_premium)
        `)
        .order('draw_date', { ascending: false })

      if (winnersError) {
        console.error('Error fetching winners:', winnersError)
      }

      // Calculate user entries (1 for regular, 2 for premium)
      const userEntries = userProfile?.is_premium ? 2 : 1

      setStats({
        totalParticipants: totalCount || 0,
        userParticipated: !!participationData,
        participatedAt: participationData?.participated_at || null,
        userEntries
      })

      setWinners(winnersData || [])
    } catch (error) {
      console.error('Error fetching event data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleParticipate = async () => {
    if (!user || stats.userParticipated || participating) return

    setParticipating(true)
    try {
      // Get user's IP address (optional, for security)
      let ipAddress = null
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        ipAddress = ipData.ip
      } catch (ipError) {
        console.warn('Could not get IP address:', ipError)
      }

      const { error } = await supabase
        .from('inauguration_participants')
        .insert({
          user_id: user.id,
          ip_address: ipAddress
        })

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - user already participated
          alert('Você já está participando do evento!')
          await fetchEventData() // Refresh data
          return
        }
        throw error
      }

      setShowSuccessModal(true)
      await fetchEventData() // Refresh data
    } catch (error) {
      console.error('Error participating in event:', error)
      alert('Erro ao participar do evento. Tente novamente.')
    } finally {
      setParticipating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getDayStatus = (day: number) => {
    const today = new Date()
    const dayDate = new Date(2025, 6, day) // Julho de 2025
    
    const winner = winners.find(w => {
      const winnerDate = new Date(w.draw_date)
      return winnerDate.getDate() === day && winnerDate.getMonth() === 6 && winnerDate.getFullYear() === 2025
    })

    if (winner) return 'completed'
    if (dayDate < today) return 'missed'
    if (dayDate.toDateString() === today.toDateString()) return 'today'
    return 'upcoming'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando evento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 overflow-x-hidden">
      <div className="max-w-md mx-auto pb-20 px-4">
        {/* Header */}
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
            
            <div className="flex items-center space-x-2 bg-black bg-opacity-30 backdrop-blur-sm rounded-full px-4 py-2">
              <PartyPopper className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">Eventos</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden -mt-4">
          {/* Tabs */}
          <div className="flex bg-gray-50 border-b border-gray-200">
            <button
              onClick={() => setActiveEventTab('tasks')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeEventTab === 'tasks'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Tarefas Diárias</span>
              </div>
            </button>
            {IS_DAILY_RAFFLE_ENABLED && (
              <button
                onClick={() => setActiveEventTab('raffle')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeEventTab === 'raffle'
                    ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Gift className="w-5 h-5" />
                  <span>Sorteio Diário</span>
                </div>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeEventTab === 'tasks' ? (
              <DailyTasks />
            ) : IS_DAILY_RAFFLE_ENABLED ? (
              <div className="space-y-6 bg-gray-900 -m-6 p-6 rounded-lg">
                {/* Hero Section */}
                <div className="text-center px-6 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl relative"
          >
            <Gift className="w-12 h-12 text-white" />
            {/* Floating diamonds */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <span className="text-2xl">💎</span>
            </motion.div>
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -bottom-2 -left-2"
            >
              <span className="text-xl">💎</span>
            </motion.div>
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-2">
            <span className="text-2xl">💎</span>
            Sorteio Diário
            <span className="text-2xl">💎</span>
          </h1>
          <p className="text-pink-200 text-lg leading-relaxed mb-4">
            Participe e concorra a diamantes de 21 a 31 de julho!
          </p>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 mb-6 relative overflow-hidden">
            {/* Background diamonds */}
            <div className="absolute inset-0 opacity-10">
              <span className="absolute top-2 left-4 text-3xl">💎</span>
              <span className="absolute top-8 right-6 text-2xl">💎</span>
              <span className="absolute bottom-4 left-8 text-xl">💎</span>
              <span className="absolute bottom-2 right-4 text-3xl">💎</span>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-3xl"
                >
                  💎
                </motion.span>
                <span className="text-white font-bold text-2xl">30 Diamantes</span>
                <motion.span
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-3xl"
                >
                  💎
                </motion.span>
              </div>
              <p className="text-pink-200 text-sm">
                Sorteados todos os dias de 21 a 31 de julho!
              </p>
            </div>
          </div>
        </div>

        {/* Premium Benefits Alert */}
        {userProfile?.is_premium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-6 mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4"
          >
            <div className="flex items-center space-x-3 text-white">
              <Crown className="w-6 h-6" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">Benefício Premium!</h3>
                <p className="text-sm opacity-90">
                  Você tem <strong>2 entradas</strong> em cada sorteio diário!
                </p>
              </div>
              <div className="flex space-x-1">
                <span className="text-xl">💎</span>
                <span className="text-xl">💎</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Non-Premium Info */}
        {!userProfile?.is_premium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-6 mb-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 border border-yellow-400"
          >
            <div className="flex items-center space-x-3 text-white">
              <Crown className="w-6 h-6 text-yellow-400" />
              <div className="flex-1">
                <h3 className="font-bold">Usuários Premium</h3>
                <p className="text-sm text-yellow-200">
                  Ganham <strong>2 entradas</strong> por sorteio ao invés de 1!
                </p>
              </div>
              <div className="flex space-x-1">
                <span className="text-lg">💎</span>
                <Plus className="w-3 h-3 text-yellow-400" />
                <span className="text-lg">💎</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Participation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-6 mb-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6"
        >
          <div className="text-center">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center justify-center">
              <Users className="w-6 h-6 mr-2 text-yellow-400" />
              Participação
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white bg-opacity-20 rounded-xl p-4 relative">
                <span className="absolute top-1 right-1 text-lg">💎</span>
                <div className="text-2xl font-bold text-white">{stats.totalParticipants}</div>
                <div className="text-pink-200 text-sm">Participantes</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4 relative">
                <span className="absolute top-1 right-1 text-lg">💎</span>
                <div className="text-2xl font-bold text-white">{eventDays.length}</div>
                <div className="text-pink-200 text-sm">Dias de Sorteio</div>
              </div>
            </div>

            {!user ? (
              <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4">
                <p className="text-yellow-800 text-sm">
                  Faça login para participar do evento!
                </p>
              </div>
            ) : stats.userParticipated ? (
              <div className="bg-green-100 border border-green-300 rounded-xl p-4">
                <div className="flex items-center justify-center space-x-2 text-green-800 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Você está participando!</span>
                </div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {userProfile?.is_premium ? (
                    <>
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span className="text-green-700 text-sm font-medium">
                        2 entradas por sorteio (Premium)
                      </span>
                      <div className="flex space-x-1">
                        <span className="text-sm">💎</span>
                        <span className="text-sm">💎</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-green-700 text-sm">
                        1 entrada por sorteio
                      </span>
                      <span className="text-sm">💎</span>
                    </>
                  )}
                </div>
                <p className="text-green-700 text-sm">
                  Inscrito em: {stats.participatedAt ? formatDate(stats.participatedAt) : 'Data não disponível'}
                </p>
                <p className="text-green-600 text-xs mt-2 flex items-center justify-center gap-1">
                  <span>💎</span>
                  Boa sorte nos sorteios diários!
                  <span>💎</span>
                </p>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleParticipate}
                disabled={participating}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
                  participating
                    ? 'bg-yellow-600 text-white opacity-75'
                    : 'bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:from-yellow-600 hover:to-pink-600'
                }`}
              >
                {participating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Participando...</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    <span>Participar do Sorteio</span>
                    <span className="text-xl">💎</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Event Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-6 mb-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6"
        >
          <h3 className="text-white font-bold text-xl mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-400" />
            Calendário do Evento
            <span className="text-xl ml-2">💎</span>
          </h3>
          
          <div className="grid grid-cols-4 gap-3">
            {eventDays.map((day, index) => {
              const status = getDayStatus(day)
              const winner = winners.find(w => {
                const winnerDate = new Date(w.draw_date)
                return winnerDate.getDate() === day && winnerDate.getMonth() === 6 && winnerDate.getFullYear() === 2025
              })
              
              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className={`relative p-3 rounded-xl text-center ${
                    status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : status === 'today'
                      ? 'bg-yellow-500 text-white animate-pulse'
                      : status === 'missed'
                      ? 'bg-gray-500 text-gray-300'
                      : 'bg-white bg-opacity-20 text-white'
                  }`}
                >
                  <div className="font-bold">{day}</div>
                  <div className="text-xs">Jul</div>
                  
                  {status === 'completed' && (
                    <div className="absolute -top-1 -right-1">
                      <Trophy className="w-4 h-4 text-yellow-300" />
                    </div>
                  )}
                  
                  {status === 'today' && (
                    <div className="absolute -top-1 -right-1">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Diamond decoration for upcoming days */}
                  {status === 'upcoming' && (
                    <div className="absolute -top-1 -right-1">
                      <span className="text-xs">💎</span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-white">Sorteio Realizado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-white">Hoje</span>
            </div>
          </div>
        </motion.div>

        {/* Winners Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mx-6 mb-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6"
        >
          <h3 className="text-white font-bold text-xl mb-4 flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
            Ganhadores
            <span className="text-xl ml-2">💎</span>
          </h3>
          
          {winners.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-3xl">💎</span>
                <Sparkles className="w-12 h-12 text-white opacity-60" />
                <span className="text-3xl">💎</span>
              </div>
              <p className="text-white opacity-80">
                Os primeiros ganhadores serão anunciados em breve!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {winners.map((winner, index) => (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white bg-opacity-20 rounded-xl p-4 relative overflow-hidden"
                >
                  {/* Background diamonds */}
                  <span className="absolute top-1 right-1 text-lg opacity-30">💎</span>
                  <span className="absolute bottom-1 left-1 text-sm opacity-20">💎</span>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">
                            {winner.profile.name}
                          </span>
                          {winner.profile.is_premium && (
                            <Star className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <div className="text-pink-200 text-sm">
                          {formatDate(winner.draw_date)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <span className="text-lg">💎</span>
                        <span className="font-bold">{winner.prize_amount}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Instagram Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mx-6 mb-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6"
        >
          <h3 className="text-white font-bold text-xl mb-4 flex items-center">
            <Instagram className="w-6 h-6 mr-2 text-pink-400" />
            Siga no Instagram
            <span className="text-xl ml-2">💎</span>
          </h3>
          
          <p className="text-pink-200 text-sm mb-4">
            Os ganhadores são anunciados diariamente no nosso Instagram oficial!
          </p>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open('https://www.instagram.com/upduo.top', '_blank')}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
          >
            <Instagram className="w-5 h-5" />
            <span>@upduo.top</span>
            <span className="text-lg">💎</span>
          </motion.button>
        </motion.div>

        {/* Rules Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mx-6 mb-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6"
        >
          <h3 className="text-white font-bold text-xl mb-4 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
            Regras do Evento
          </h3>
          
          <div className="space-y-3 text-pink-200 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-lg mt-0.5 flex-shrink-0">💎</span>
              <span>Evento válido de <strong>21 a 31 de julho de 2025</strong></span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg mt-0.5 flex-shrink-0">💎</span>
              <span>Cada usuário pode participar apenas uma vez</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg mt-0.5 flex-shrink-0">💎</span>
              <span>Sorteio diário de 30 diamantes por dia</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg mt-0.5 flex-shrink-0">💎</span>
              <span><strong>Usuários Premium têm 2 entradas por sorteio</strong></span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg mt-0.5 flex-shrink-0">💎</span>
              <span>Ganhadores anunciados no Instagram @upduo.top</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg mt-0.5 flex-shrink-0">💎</span>
              <span>Diamantes creditados automaticamente na conta</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg mt-0.5 flex-shrink-0">💎</span>
              <span>Cada usuário pode ganhar apenas uma vez durante todo o evento</span>
            </div>
          </div>
        </motion.div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Sorteio Temporariamente Desativado</h3>
                <p className="text-gray-600">
                  O sorteio diário está temporariamente indisponível. Volte em breve!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
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
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
            >
              {/* Background diamonds */}
              <div className="absolute inset-0 opacity-10">
                <span className="absolute top-4 left-4 text-3xl">💎</span>
                <span className="absolute top-8 right-6 text-2xl">💎</span>
                <span className="absolute bottom-6 left-8 text-xl">💎</span>
                <span className="absolute bottom-4 right-4 text-3xl">💎</span>
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                  <span className="text-2xl">💎</span>
                  Parabéns!
                  <span className="text-2xl">💎</span>
                </h2>
                <p className="text-gray-600 mb-4">
                  Você está participando do sorteio diário! 
                </p>
                
                {userProfile?.is_premium ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                    <div className="flex items-center justify-center space-x-2 text-yellow-800">
                      <Crown className="w-5 h-5" />
                      <span className="font-semibold">Benefício Premium Ativo!</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      Você tem <strong>2 entradas</strong> em cada sorteio diário
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 mb-6">
                    Boa sorte nos sorteios diários de 30 diamantes!
                  </p>
                )}
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <span className="text-lg">💎</span>
                    <span>Continuar</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      window.open('https://www.instagram.com/upduo.top', '_blank')
                      setShowSuccessModal(false)
                    }}
                    className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Seguir no Instagram</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}