import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Send, User, Trophy } from 'lucide-react'
import { getRankImageUrl } from '../constants/gameData'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message_text: string
  message_type: string
  diamond_count: number | null
  created_at: string
  isOptimistic?: boolean // Flag para mensagens otimistas
}

interface Profile {
  id: string
  name: string
  age: number
  city: string
  current_rank: string
  favorite_heroes: string[]
  favorite_lines: string[]
  bio: string
}

interface ChatInterfaceProps {
  matchId: string
  onBack: () => void
  onViewProfile: (profileId: string) => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ matchId, onBack, onViewProfile }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)

  // Buscar dados do chat (match e mensagens)
  useEffect(() => {
    fetchChatData()
  }, [matchId, user])

  // Configurar assinatura em tempo real (apenas quando otherProfile estiver carregado)
  useEffect(() => {
    if (user && otherProfile) {
      setupRealtimeSubscription()
    }

    return () => {
      if (subscriptionRef.current) {
        console.log('ChatInterface: Cleaning up realtime subscription')
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [user, otherProfile])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mark messages as read when chat is opened or new messages arrive
  useEffect(() => {
    if (user && otherProfile && messages.length > 0) {
      markMessagesAsRead()
    }
  }, [user, otherProfile, messages])

  const markMessagesAsRead = async () => {
    if (!user || !otherProfile || messages.length === 0) return

    try {
      const latestMessage = messages[messages.length - 1]
      if (!latestMessage || latestMessage.sender_id === user.id) return // Don't mark own messages as read

      console.log('ChatInterface: Marking messages as read up to:', latestMessage.id)

      // Determine which column to update based on current user
      const updateColumn = user.id < otherProfile.id ? 'user1_last_read_message_id' : 'user2_last_read_message_id'
      
      const { error } = await supabase
        .from('matches')
        .update({ [updateColumn]: latestMessage.id })
        .eq('id', matchId)

      if (error) {
        console.error('ChatInterface: Error marking messages as read:', error)
      } else {
        console.log('ChatInterface: Messages marked as read successfully')
      }
    } catch (error) {
      console.error('ChatInterface: Error in markMessagesAsRead:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChatData = async () => {
    if (!user) return

    console.log('ChatInterface: Fetching chat data for match', matchId)

    try {
      // Get the other user's profile from the match
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single()

      console.log('ChatInterface: Match data', { matchData, matchError })

      if (matchError) throw matchError

      const otherUserId = matchData.user1_id === user.id ? matchData.user2_id : matchData.user1_id

      // Get other user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single()

      console.log('ChatInterface: Other profile data', { profileData, profileError })

      if (profileError) throw profileError
      setOtherProfile(profileData)

      // Get messages between the two users
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      console.log('ChatInterface: Messages data', { messagesData, messagesError })

      if (messagesError) throw messagesError
      setMessages(messagesData || [])
    } catch (error) {
      console.error('Error fetching chat data:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    console.log('ChatInterface: Setting up realtime subscription')

    // Limpar assinatura anterior se existir
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    const subscription = supabase
      .channel(`messages-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user!.id},receiver_id.eq.${otherProfile!.id}),and(sender_id.eq.${otherProfile!.id},receiver_id.eq.${user!.id}))`
        },
        (payload) => {
          console.log('ChatInterface: New message received via realtime', payload)
          const newMessage = payload.new as Message
          
          // Evitar duplicação de mensagens otimistas
          setMessages(prev => {
            const existingMessage = prev.find(msg => 
              msg.message_text === newMessage.message_text && 
              msg.sender_id === newMessage.sender_id &&
              msg.isOptimistic
            )
            
            if (existingMessage) {
              // Substituir mensagem otimística pela real
              return prev.map(msg => 
                msg.isOptimistic && 
                msg.message_text === newMessage.message_text && 
                msg.sender_id === newMessage.sender_id
                  ? { ...newMessage, isOptimistic: false }
                  : msg
              )
            } else {
              // Adicionar nova mensagem se não for duplicata
              const isDuplicate = prev.some(msg => msg.id === newMessage.id)
              if (!isDuplicate) {
                return [...prev, newMessage]
              }
              return prev
            }
          })
        }
      )
      .subscribe((status) => {
        console.log('ChatInterface: Realtime subscription status', status)
      })

    subscriptionRef.current = subscription
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !otherProfile || !newMessage.trim() || sending) return

    const messageText = newMessage.trim()
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: otherProfile.id,
      message_text: messageText,
      message_type: 'text',
      diamond_count: null,
      created_at: new Date().toISOString(),
      isOptimistic: true
    }

    console.log('ChatInterface: Sending message', {
      senderId: user.id,
      receiverId: otherProfile.id,
      message: messageText
    })

    // Adicionar mensagem otimística imediatamente
    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage('')
    setSending(true)

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: otherProfile.id,
          message_text: messageText,
          message_type: 'text'
        })
        .select()

      console.log('ChatInterface: Message sent result', { data, error })

      if (error) throw error

      // A mensagem real será adicionada via realtime subscription
      // e substituirá a mensagem otimística
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Remover mensagem otimística em caso de erro
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      
      // Restaurar texto da mensagem
      setNewMessage(messageText)
      
      alert('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando conversa...</p>
        </div>
      </div>
    )
  }

  if (!otherProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar conversa</h2>
          <p className="text-blue-200">Não foi possível encontrar o perfil do usuário</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg p-4">
        <div className="max-w-md mx-auto flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          <motion.div 
            className="flex-1 cursor-pointer text-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewProfile(otherProfile.id)}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 overflow-hidden">
              {otherProfile.avatar_url ? (
                <img
                  src={otherProfile.avatar_url}
                  alt={otherProfile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onLoad={() => console.log('ChatInterface: Avatar loaded successfully:', otherProfile.avatar_url)}
                  onError={() => console.error('ChatInterface: Error loading avatar:', otherProfile.avatar_url)}
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{otherProfile.name}</h2>
            <div className="flex items-center justify-center space-x-2">
              <img
                src={getRankImageUrl(otherProfile.current_rank)}
                alt={otherProfile.current_rank}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">{otherProfile.current_rank}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="max-w-md mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.sender_id === user.id
                      ? `bg-gradient-to-r from-blue-600 to-purple-600 text-white ${
                          message.isOptimistic ? 'opacity-70' : ''
                        }`
                      : 'bg-white text-gray-800 shadow-md'
                  }`}
                >
                  <p className="text-sm">{message.message_text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.isOptimistic ? 'Enviando...' : new Date(message.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Primeira conversa!</h3>
              <p className="text-blue-200 text-sm">
                Vocês deram match! Comece a conversa e encontrem seu duo perfeito.
              </p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              {sending && <span className="text-xs">Enviando...</span>}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  )
}