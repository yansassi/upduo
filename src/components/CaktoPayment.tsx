import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Crown, CreditCard, Check, AlertCircle, ExternalLink } from 'lucide-react'

interface CaktoPaymentProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export const CaktoPayment: React.FC<CaktoPaymentProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // URLs de pagamento do Cakto para diferentes valores
  const caktoPaymentUrls = {
    premium: 'https://pay.cakto.com.br/8bg52uh_478091', // R$ 25 - Premium
    diamonds_165: 'https://pay.cakto.com.br/fq5rcxf_479668', // R$ 10 - 165 diamantes
    diamonds_275: 'https://pay.cakto.com.br/33j4cpa_479674', // R$ 15 - 275 diamantes
    diamonds_565: 'https://pay.cakto.com.br/ix3hbnz_479679'  // R$ 25 - 565 diamantes
  }

  const handlePremiumPayment = async () => {
    if (!user) {
      setError('Usuário não autenticado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Registrar intenção de pagamento no banco
      const { data: paymentRecord, error: dbError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: 25.00,
          currency: 'BRL',
          description: 'UpDuo Premium - Assinatura Mensal',
          status: 'pending'
        })
        .select()
        .single()

      if (dbError) {
        console.error('Erro ao registrar pagamento:', dbError)
        throw new Error('Erro ao registrar pagamento')
      }

      console.log('Pagamento registrado:', paymentRecord)

      // Redirecionar para o Cakto
      const caktoUrl = caktoPaymentUrls.premium
      setPaymentUrl(caktoUrl)

      // Abrir em nova aba
      window.open(caktoUrl, '_blank')

      // Mostrar instruções para o usuário
      alert('Você será redirecionado para o pagamento. Após completar o pagamento, seu Premium será ativado automaticamente!')

    } catch (error) {
      console.error('Erro no processo de pagamento:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Verificar se o usuário já é premium
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erro ao verificar status:', error)
        return
      }

      if (profile.is_premium) {
        alert('✅ Pagamento confirmado! Você agora é Premium!')
        if (onSuccess) {
          onSuccess()
        }
      } else {
        alert('⏳ Pagamento ainda não foi confirmado. Aguarde alguns minutos e tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">UpDuo Premium</h2>
        <p className="text-gray-600">Desbloqueie todos os recursos por apenas R$ 25/mês</p>
      </div>

      {/* Benefícios */}
      <div className="bg-yellow-50 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Crown className="w-5 h-5 text-yellow-600 mr-2" />
          Benefícios Premium:
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center">
            <Check className="w-4 h-4 text-green-600 mr-2" />
            Receba 30 diamantes de bônus
          </li>
          <li className="flex items-center">
            <Check className="w-4 h-4 text-green-600 mr-2" />
            100 swipes por dia (vs 30 gratuitos)
          </li>
          <li className="flex items-center">
            <Check className="w-4 h-4 text-green-600 mr-2" />
            Filtros avançados de busca
          </li>
          <li className="flex items-center">
            <Check className="w-4 h-4 text-green-600 mr-2" />
            Badge verificado no perfil
          </li>
          <li className="flex items-center">
            <Check className="w-4 h-4 text-green-600 mr-2" />
            Desfazer último swipe
          </li>
          <li className="flex items-center">
            <Check className="w-4 h-4 text-green-600 mr-2" />
            Prioridade nos matches
          </li>
          <li className="flex items-center">
            <Check className="w-4 h-4 text-green-600 mr-2" />
            Ver quem te curtiu
          </li>
          <li className="flex items-center">
            <Check className="w-4 h-4 text-green-600 mr-2" />
            Ver quem te curtiu
          </li>
        </ul>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="space-y-3">
        {!paymentUrl ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePremiumPayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processando...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Assinar Premium - R$ 25</span>
              </>
            )}
          </motion.button>
        ) : (
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(paymentUrl, '_blank')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Abrir Pagamento</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={checkPaymentStatus}
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Já Paguei - Verificar Status</span>
                </>
              )}
            </motion.button>
          </div>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Info de Segurança */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 text-blue-800 mb-2">
          <span className="text-sm">🔒</span>
          <span className="text-sm font-medium">Pagamento 100% Seguro</span>
        </div>
        <p className="text-xs text-blue-700">
          Processado pelo Cakto com criptografia SSL. Seus dados estão protegidos.
        </p>
      </div>

      {/* Webhook Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          💡 Seu Premium será ativado automaticamente após a confirmação do pagamento
        </p>
      </div>
    </div>
  )
}