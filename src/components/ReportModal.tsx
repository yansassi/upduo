import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { X, AlertTriangle, Flag, MessageSquare, User, Heart, Shield, Send } from 'lucide-react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName: string
  matchId: string
}

const REPORT_REASONS = [
  {
    id: 'inappropriate_messages',
    label: 'Mensagens inapropriadas',
    icon: MessageSquare,
    description: 'Conteúdo ofensivo, spam ou assédio'
  },
  {
    id: 'fake_profile',
    label: 'Perfil falso',
    icon: User,
    description: 'Informações falsas ou fotos de outras pessoas'
  },
  {
    id: 'harassment',
    label: 'Assédio',
    icon: Shield,
    description: 'Comportamento abusivo ou perseguição'
  },
  {
    id: 'inappropriate_content',
    label: 'Conteúdo inadequado',
    icon: Flag,
    description: 'Imagens ou mensagens inadequadas'
  },
  {
    id: 'scam',
    label: 'Golpe/Fraude',
    icon: AlertTriangle,
    description: 'Tentativa de golpe ou pedido de dinheiro'
  },
  {
    id: 'other',
    label: 'Outro motivo',
    icon: Heart,
    description: 'Outro tipo de comportamento inadequado'
  }
]

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  matchId
}) => {
  const { user } = useAuth()
  const [selectedReason, setSelectedReason] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedReason || loading) return

    console.log('ReportModal: Submitting report', {
      reporterId: user.id,
      reportedId: reportedUserId,
      matchId,
      reason: selectedReason,
      comment
    })

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_id: reportedUserId,
          match_id: matchId,
          reason: selectedReason,
          comment: comment.trim() || null
        })
        .select()

      console.log('ReportModal: Report submission result', { data, error })

      if (error) throw error

      console.log('ReportModal: Report submitted successfully')
      setSubmitted(true)
      
      // Reset form
      setSelectedReason('')
      setComment('')
      
      // Close modal after showing success message
      setTimeout(() => {
        setSubmitted(false)
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Erro ao enviar denúncia. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setSelectedReason('')
      setComment('')
      setSubmitted(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Flag className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Denunciar Usuário</h3>
                <p className="text-sm text-gray-600">{reportedUserName}</p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Denúncia Enviada!</h4>
              <p className="text-gray-600 text-sm">
                Obrigado por nos ajudar a manter a comunidade segura. 
                Analisaremos sua denúncia em breve.
              </p>
            </motion.div>
          ) : (
            /* Report Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Motivo da denúncia *
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {REPORT_REASONS.map((reason) => {
                    const IconComponent = reason.icon
                    return (
                      <motion.label
                        key={reason.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedReason === reason.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={reason.id}
                          checked={selectedReason === reason.id}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedReason === reason.id
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${
                            selectedReason === reason.id ? 'text-red-700' : 'text-gray-800'
                          }`}>
                            {reason.label}
                          </div>
                          <div className={`text-xs ${
                            selectedReason === reason.id ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {reason.description}
                          </div>
                        </div>
                      </motion.label>
                    )
                  })}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentário adicional (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Descreva mais detalhes sobre o problema..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {comment.length}/500 caracteres
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-800">
                    <strong>Importante:</strong> Denúncias falsas podem resultar em suspensão da sua conta. 
                    Use este recurso apenas para reportar comportamentos genuinamente inadequados.
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedReason || loading}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Enviando...' : 'Enviar Denúncia'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}