import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Diamond, Crown, Star, Zap, Heart, Users, MessageCircle, Check, Sparkles } from 'lucide-react'

interface Profile {
  id: string
  is_premium: boolean
  diamond_count: number
}

interface DiamondPackage {
  id: string
  count: number
  price: number
  currency: string
  color: string | null
}

export const PremiumArea: React.FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [diamondPackages, setDiamondPackages] = useState<DiamondPackage[]>([])
  const [userDiamonds, setUserDiamonds] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchDiamondPackages()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, is_premium, diamond_count')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(profileData)

      // Atualizar contador de diamantes em tempo real
      setUserDiamonds(profileData.diamond_count || 0)
      
      console.log('PremiumArea: User diamond count updated:', profileData.diamond_count)
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Atualizar diamantes periodicamente para refletir mudanças
  useEffect(() => {
    if (user && profile?.is_premium) {
      const interval = setInterval(() => {
        fetchUserData()
      }, 5000) // Atualiza a cada 5 segundos

      return () => clearInterval(interval)
    }
  }, [user, profile?.is_premium])

  const fetchDiamondPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('diamond_packages')
        .select('*')
        .order('price', { ascending: true })

      if (error) throw error
      setDiamondPackages(data || [])
    } catch (error) {
      console.error('Error fetching diamond packages:', error)
    }
  }

  const handlePurchasePremium = () => {
    // Em produção, isso abriria o fluxo de pagamento
    alert('Redirecionando para pagamento Premium... (Em desenvolvimento)')
  }

  const handlePurchaseDiamonds = (packageData: DiamondPackage) => {
    // Em produção, isso abriria o fluxo de pagamento
    alert(`Comprando ${packageData.count} diamantes por R$ ${packageData.price}... (Em desenvolvimento)`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando área premium...</p>
        </div>
      </div>
    )
  }

  if (!profile?.is_premium) {
    // Página de assinatura para usuários não premium
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 p-4">
        <div className="max-w-md mx-auto pt-8 pb-20">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Crown className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">UpDuo Premium</h1>
            <p className="text-blue-200">Desbloqueie todo o potencial do app</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-8 mb-6"
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Diamond className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold text-gray-800">R$ 25</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <p className="text-gray-600">Primeiro mês com 50% de desconto!</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">Swipes ilimitados</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">Badge verificado premium</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">Prioridade nos matches</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">Ver quem te curtiu</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">Filtros avançados de busca</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">100 diamantes grátis mensais</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePurchasePremium}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
            >
              <Crown className="w-6 h-6" />
              <span>Assinar Premium</span>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center"
          >
            <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Garantia de 7 dias</h3>
            <p className="text-blue-200 text-sm">
              Não ficou satisfeito? Cancelamos e devolvemos seu dinheiro!
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // Painel premium para usuários premium
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 p-4">
      <div className="max-w-md mx-auto pt-8 pb-20">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Área Premium</h1>
          <p className="text-blue-200">Bem-vindo ao clube VIP!</p>
        </div>

        {/* Contador de Diamantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Seus Diamantes</h3>
              <p className="text-blue-100 text-sm">Use para super likes e boosts</p>
            </div>
            <div className="flex items-center space-x-2">
              <Diamond className="w-8 h-8 text-yellow-300" />
              <span className="text-3xl font-bold">{userDiamonds}</span>
            </div>
          </div>
        </motion.div>

        {/* Vantagens Premium Ativas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            Suas Vantagens Premium
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">Swipes</p>
              <p className="text-xs text-gray-600">Ilimitados</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">Super Likes</p>
              <p className="text-xs text-gray-600">5 por dia</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">Prioridade</p>
              <p className="text-xs text-gray-600">Nos matches</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">Badge</p>
              <p className="text-xs text-gray-600">Verificado</p>
            </div>
          </div>
        </motion.div>

        {/* Pacotes de Diamantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Diamond className="w-6 h-6 text-purple-600 mr-2" />
            Comprar Diamantes
          </h3>
          
          <div className="space-y-3">
            {diamondPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    pkg.color === 'gold' ? 'bg-yellow-100' :
                    pkg.color === 'silver' ? 'bg-gray-100' :
                    'bg-purple-100'
                  }`}>
                    <Diamond className={`w-6 h-6 ${
                      pkg.color === 'gold' ? 'text-yellow-600' :
                      pkg.color === 'silver' ? 'text-gray-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{pkg.count} Diamantes</p>
                    <p className="text-sm text-gray-600">R$ {pkg.price}</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePurchaseDiamonds(pkg)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Comprar
                </motion.button>
              </motion.div>
            ))}
          </div>
          
          {diamondPackages.length === 0 && (
            <div className="text-center py-8">
              <Diamond className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum pacote disponível no momento</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}