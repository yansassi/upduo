import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Diamond, ShoppingCart, Star, Zap, Gift, MessageSquare, Check, Sparkles } from 'lucide-react'

interface DiamondPurchaseProps {
  onBack: () => void
}

interface DiamondPackage {
  id: string
  count: number
  price: number
  currency: string
  color: string | null
}

export const DiamondPurchase: React.FC<DiamondPurchaseProps> = ({ onBack }) => {
  const { user } = useAuth()
  const [userDiamonds, setUserDiamonds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [diamondPackages, setDiamondPackages] = useState<DiamondPackage[]>([])

  useEffect(() => {
    if (user) {
      fetchUserDiamonds()
      fetchDiamondPackages()
    }
  }, [user])

  const fetchUserDiamonds = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('diamond_count')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserDiamonds(data.diamond_count || 0)
    } catch (error) {
      console.error('Error fetching user diamonds:', error)
    } finally {
      setLoading(false)
    }
  }

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
  const handlePurchase = (pkg: DiamondPackage) => {
    const whatsappNumber = '5545988349638'
    const message = encodeURIComponent(
      `Olá! Gostaria de comprar ${pkg.count} diamantes por R$ ${pkg.price} no ML Duo. Pode me ajudar com o pagamento?`
    )
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-800 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando loja...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-800 to-red-900">
      <div className="max-w-md mx-auto pb-20">
        {/* Header */}
        <div className="relative z-20 p-4 pt-8">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-3 bg-black bg-opacity-30 backdrop-blur-sm rounded-full hover:bg-opacity-40 transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
            
            <div className="flex items-center space-x-2 bg-black bg-opacity-30 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-lg">💎</span>
              <span className="text-white font-bold">{userDiamonds}</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center px-6 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <span className="text-4xl">💎</span>
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-3">Loja de Diamantes</h1>
          <p className="text-yellow-200 text-lg leading-relaxed">
            Compre diamantes para enviar presentes especiais e se destacar no app!
          </p>
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-6 mb-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6"
        >
          <h3 className="text-white font-bold text-lg mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
            O que você pode fazer com diamantes:
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <span>Enviar presentes especiais para seus matches</span>
            </div>
            
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <span>Destacar seu perfil para mais visibilidade</span>
            </div>
            
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
              <span>Converter em diamantes do Mobile Legends</span>
            </div>
          </div>
        </motion.div>

        {/* Diamond Packages */}
        <div className="px-6 space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Escolha seu Pacote</h2>
          
          {diamondPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="relative bg-white rounded-2xl p-6 shadow-xl"
            >
              {/* Popular Badge - mostrar para o segundo pacote */}
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>MAIS POPULAR</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-blue-100' :
                    index === 1 ? 'bg-green-100' :
                    index === 2 ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <span className="text-3xl">💎</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-2xl font-bold text-gray-800">{pkg.count}</h3>
                      <span className="text-gray-600">diamantes</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-800">R$ {pkg.price}</div>
                  <div className="text-sm text-gray-500">
                    R$ {(pkg.price / pkg.count).toFixed(2)} por diamante
                  </div>
                </div>
              </div>

              {/* Value Proposition */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  {index === 0 && "Perfeito para começar a enviar presentes"}
                  {index === 1 && "Melhor custo-benefício para usuários regulares"}
                  {index === 2 && "Ótimo valor para usuários frequentes"}
                  {index === 3 && "Máximo valor com melhor economia"}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePurchase(pkg)}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
                  index === 1
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Fazer Pedido</span>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {diamondPackages.length === 0 && !loading && (
          <div className="px-6 text-center py-8">
            <span className="text-5xl block mb-3 text-white">💎</span>
            <p className="text-white">Nenhum pacote disponível no momento</p>
          </div>
        )}

        {/* Payment Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mx-6 mt-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-white font-bold text-lg mb-3">Como Funciona o Pagamento</h3>
          
          <div className="space-y-3 text-white text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">1</span>
              </div>
              <span>Clique em "Fazer Pedido" no pacote desejado</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">2</span>
              </div>
              <span>Você será direcionado para nosso WhatsApp</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">3</span>
              </div>
              <span>Faça o pagamento via PIX e receba seus diamantes</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-500 bg-opacity-20 rounded-lg">
            <p className="text-green-200 text-xs">
              💎 Diamantes são creditados automaticamente após confirmação do pagamento
            </p>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mx-6 mt-6 bg-blue-500 bg-opacity-20 backdrop-blur-sm rounded-xl p-4"
        >
          <div className="flex items-center space-x-3 text-blue-200">
            <Check className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Pagamento 100% Seguro</strong>
              <br />
              Processamento via PIX com confirmação instantânea
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}