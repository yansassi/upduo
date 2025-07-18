import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Bell, Mail, Heart, MessageSquare, Users, Save, Check } from 'lucide-react'

interface NotificationPreferences {
  email_new_messages: boolean
  email_new_matches: boolean
  email_inactive_reminders: boolean
  email_marketing: boolean
}

interface NotificationSettingsProps {
  onBack?: () => void
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onBack }) => {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_new_messages: true,
    email_new_matches: true,
    email_inactive_reminders: true,
    email_marketing: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      fetchPreferences()
    }
  }, [user])

  const fetchPreferences = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification preferences:', error)
        return
      }

      if (data) {
        setPreferences({
          email_new_messages: data.email_new_messages,
          email_new_matches: data.email_new_matches,
          email_inactive_reminders: data.email_inactive_reminders,
          email_marketing: data.email_marketing
        })
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error saving preferences:', error)
        alert('Erro ao salvar preferências. Tente novamente.')
        return
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Erro ao salvar preferências. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 overflow-x-hidden">
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
              <Bell className="w-5 h-5 text-white" />
              <span className="text-white font-bold">Notificações</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden -mt-4">
          {/* Header Section */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h1 className="text-2xl font-bold mb-2">Configurações de Notificação</h1>
              <p className="text-blue-100">
                Escolha como você quer ser notificado sobre atividades no UpDuo
              </p>
            </div>
          </div>

          {/* Settings */}
          <div className="p-6 space-y-6">
            {/* Email Notifications Section */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Notificações por Email</h3>
              </div>

              <div className="space-y-4">
                {/* New Messages */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Novas Mensagens</h4>
                      <p className="text-sm text-gray-600">
                        Receba um email quando alguém te enviar uma mensagem
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.email_new_messages}
                      onChange={(e) => updatePreference('email_new_messages', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* New Matches */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-pink-600" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Novos Matches</h4>
                      <p className="text-sm text-gray-600">
                        Receba um email quando você der match com alguém
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.email_new_matches}
                      onChange={(e) => updatePreference('email_new_matches', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Inactive Reminders */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Lembretes de Atividade</h4>
                      <p className="text-sm text-gray-600">
                        Receba lembretes quando ficar um tempo sem usar o app
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.email_inactive_reminders}
                      onChange={(e) => updatePreference('email_inactive_reminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Novidades e Promoções</h4>
                      <p className="text-sm text-gray-600">
                        Receba emails sobre novos recursos e ofertas especiais
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.email_marketing}
                      onChange={(e) => updatePreference('email_marketing', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">📧 Sobre as notificações por email:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Você só receberá emails relevantes e importantes</li>
                    <li>• Nunca enviaremos spam ou emails excessivos</li>
                    <li>• Você pode alterar essas configurações a qualquer momento</li>
                    <li>• Emails de segurança sempre serão enviados</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={savePreferences}
              disabled={saving}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              } disabled:opacity-50`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Salvando...</span>
                </>
              ) : saved ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Salvo!</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Salvar Configurações</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}