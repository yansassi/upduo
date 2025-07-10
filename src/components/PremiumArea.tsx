import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Diamond, Crown, Star, Zap, Heart, Users, MessageCircle, Check, Sparkles, Rocket, Code, TrendingUp, Shield, X, MessageSquare } from 'lucide-react'

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
  const [showContactModal, setShowContactModal] = useState(false)

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
    const whatsappNumber = '5545988349638'
    const message = encodeURIComponent('Olá! Quero ser premium do UpDuo. Pode me ajudar com a assinatura?')
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const handlePurchaseDiamonds = (packageData: DiamondPackage) => {
    const whatsappNumber = '5545988349638'
    const message = encodeURIComponent(`Olá! Gostaria de comprar ${packageData.count} diamantes por R$ ${packageData.price} no UpDuo. Pode me ajudar?`)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
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
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">100 swipes por dia</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">Perfil Verificado</span>
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
                <span className="text-gray-700">Filtros avançados de busca</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">50 diamantes grátis mensais</span>
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

          {/* App Improvement Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Ajude a Melhorar o App</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Ao assinar Premium, você não apenas desbloqueia recursos incríveis, mas também nos ajuda a:
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Code className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Desenvolver novos recursos</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Melhorar a experiência</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Manter servidores seguros</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Expandir a comunidade</p>
              </div>
            </div>
            
          </motion.div>
          {/* Diamond Conversion Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center"
          >
            <img
              src="/imgi_56_SuperValuePass.png"
              alt="Diamantes"
              className="w-12 h-12 mx-auto mb-3"
            />
            <h3 className="text-white font-semibold mb-2">Converta seus Diamantes</h3>
            <p className="text-blue-200 text-sm">
              Transforme seus diamantes do app em diamantes dentro do Mobile Legends!
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
            <img
              src="/imgi_56_SuperValuePass.png"
              alt="Premium"
              className="w-12 h-12"
            />
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
              <p className="text-xs text-gray-600">100 por dia</p>
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

        {/* Thank You Section for Premium Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Obrigado por ser Premium!</h3>
          <p className="text-gray-600 mb-4">
            Sua assinatura nos ajuda a continuar melhorando o ML Duo para toda a comunidade
          </p>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2 text-green-700">
              <Check className="w-4 h-4" />
              <span>Novos recursos em desenvolvimento</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-700">
              <Check className="w-4 h-4" />
              <span>Servidores mais rápidos</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-700">
              <Check className="w-4 h-4" />
              <span>Algoritmo de match melhorado</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-700">
              <Check className="w-4 h-4" />
              <span>Suporte prioritário</span>
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

      {/* Contact Developer Modal */}
      <AnimatePresence>
        {showContactModal && (
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
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Fale com o Desenvolvedor</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Para assinar o Premium ou comprar diamantes, entre em contato diretamente com nosso desenvolvedor via WhatsApp. 
                  Ele irá te ajudar com todo o processo!
                </p>
                
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContactDeveloper}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-3"
                  >
                    <MessageSquare className="w-6 h-6" />
                    <span>Chamar no WhatsApp</span>
                  </motion.button>
                  
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-800">
                    💬 Resposta rápida garantida durante horário comercial
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}