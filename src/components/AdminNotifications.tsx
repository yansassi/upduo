import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Send, Users, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface AdminNotificationsProps {
  onBack?: () => void
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const sendEmailNotifications = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error sending notifications:', error)
      setResults({ error: 'Erro ao enviar notificações' })
    } finally {
      setLoading(false)
    }
  }

  const checkInactiveUsers = async (days: number = 7) => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-inactive-users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ daysInactive: days })
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error checking inactive users:', error)
      setResults({ error: 'Erro ao verificar usuários inativos' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 overflow-x-hidden">
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
                ←
              </motion.button>
            )}
            
            <div className="flex items-center space-x-2 bg-black bg-opacity-30 backdrop-blur-sm rounded-full px-4 py-2">
              <Mail className="w-5 h-5 text-white" />
              <span className="text-white font-bold">Admin - Emails</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden -mt-4">
          {/* Header Section */}
          <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h1 className="text-2xl font-bold mb-2">Gerenciar Notificações</h1>
              <p className="text-purple-100">
                Envie emails e gerencie notificações dos usuários
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 space-y-6">
            {/* Send Pending Notifications */}
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Send className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Enviar Notificações Pendentes</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Processa e envia todos os emails de notificação que estão na fila (matches, mensagens, etc.)
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={sendEmailNotifications}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar Notificações</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Check Inactive Users */}
            <div className="bg-orange-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-800">Usuários Inativos</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Encontra usuários que não acessam o app há alguns dias e cria notificações de reengajamento
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => checkInactiveUsers(3)}
                  disabled={loading}
                  className="bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 text-sm"
                >
                  3 dias
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => checkInactiveUsers(7)}
                  disabled={loading}
                  className="bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-all disabled:opacity-50 text-sm"
                >
                  7 dias
                </motion.button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => checkInactiveUsers(14)}
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5" />
                    <span>14 dias (Recomendado)</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Results */}
            {results && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  {results.error ? (
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  )}
                  Resultado
                </h3>
                
                {results.error ? (
                  <div className="text-red-600">
                    <p className="font-semibold">Erro:</p>
                    <p>{results.error}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.message && (
                      <p className="text-gray-700">
                        <strong>Status:</strong> {results.message}
                      </p>
                    )}
                    
                    {results.processed !== undefined && (
                      <p className="text-gray-700">
                        <strong>Processados:</strong> {results.processed}
                      </p>
                    )}
                    
                    {results.successful !== undefined && (
                      <p className="text-green-600">
                        <strong>Enviados com sucesso:</strong> {results.successful}
                      </p>
                    )}
                    
                    {results.failed !== undefined && results.failed > 0 && (
                      <p className="text-red-600">
                        <strong>Falharam:</strong> {results.failed}
                      </p>
                    )}
                    
                    {results.inactiveUsers !== undefined && (
                      <p className="text-gray-700">
                        <strong>Usuários inativos encontrados:</strong> {results.inactiveUsers}
                      </p>
                    )}
                    
                    {results.notificationsCreated !== undefined && (
                      <p className="text-blue-600">
                        <strong>Notificações criadas:</strong> {results.notificationsCreated}
                      </p>
                    )}
                    
                    {results.users && results.users.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-800 mb-2">Usuários encontrados:</p>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {results.users.map((user: any, index: number) => (
                            <div key={index} className="text-sm bg-white p-2 rounded border">
                              <strong>{user.name}</strong> ({user.email}) - {user.daysInactive} dias inativo
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Como funciona:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>Notificações automáticas:</strong> Matches e mensagens geram emails automaticamente</li>
                    <li>• <strong>Fila de processamento:</strong> Emails ficam pendentes até serem enviados</li>
                    <li>• <strong>Usuários inativos:</strong> Sistema detecta quem não usa o app há dias</li>
                    <li>• <strong>Preferências:</strong> Usuários podem desabilitar tipos de email</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}