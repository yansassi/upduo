import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Send, User, Trophy, BadgeCheck, Diamond, Gift, Flag } from 'lucide-react'
import { getRankImageUrl } from '../constants/gameData'
import { ReportModal } from './ReportModal'

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
  is_premium: boolean
  diamond_count: number
}

interface ChatInterfaceProps {
  matchId: string
  onBack: () => void
  onViewProfile: (profileId: string) => void
  onMessageSent?: () => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ matchId, onBack, onViewProfile, onMessageSent }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showDiamondModal, setShowDiamondModal] = useState(false)
  const [diamondAmount, setDiamondAmount] = useState(1)
  const [userDiamonds, setUserDiamonds] = useState(0)
  const [showReportModal, setShowReportModal] = useState(false)
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
        .select('*, diamond_count')
        .eq('id', otherUserId)
        .single()

      console.log('ChatInterface: Other profile data', { profileData, profileError })

      if (profileError) throw profileError
      setOtherProfile(profileData)

      // Get current user's diamond count
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('profiles')
        .select('diamond_count')
        .eq('id', user.id)
        .single()

      if (currentUserError) throw currentUserError
      setUserDiamonds(currentUserData.diamond_count || 0)

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
          
          // Notify parent component that a message was received
          if (onMessageSent && newMessage.sender_id !== user!.id) {
            onMessageSent()
          }
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

      // Notify parent component that a message was sent
      if (onMessageSent) {
        onMessageSent()
      }
      
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

  const sendDiamonds = async () => {
    if (!user || !otherProfile || diamondAmount <= 0 || diamondAmount > userDiamonds) return

    console.log('ChatInterface: Sending diamonds', {
      senderId: user.id,
      receiverId: otherProfile.id,
      amount: diamondAmount
    })

    setSending(true)
    try {
      // 1. Chama a função segura de transferência de diamantes
      console.log('ChatInterface: Calling transfer_diamonds function...')
      const { data: transferResult, error: transferError } = await supabase
        .rpc('transfer_diamonds', {
          p_sender_id: user.id,
          p_receiver_id: otherProfile.id,
          p_amount: diamondAmount
        })

      console.log('ChatInterface: Transfer function result:', { transferResult, transferError })

      if (transferError) {
        console.error('ChatInterface: Error calling transfer function:', transferError)
        throw new Error(`Erro na transferência: ${transferError.message}`)
      }

      if (!transferResult?.success) {
        console.error('ChatInterface: Transfer failed:', transferResult?.error)
        throw new Error(transferResult?.error || 'Falha na transferência de diamantes')
      }

      console.log('ChatInterface: Transfer successful!', {
        transactionId: transferResult.transaction_id,
        senderNewBalance: transferResult.sender_new_balance,
        receiverNewBalance: transferResult.receiver_new_balance
      })

      // 2. Criar mensagem de diamante no chat
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: otherProfile.id,
          message_type: 'diamond',
          diamond_count: diamondAmount
        })
        .select('id')
        .single()

      if (messageError) {
        console.error('Error creating diamond message:', messageError)
        // Não fazer rollback da transferência por erro de mensagem - os diamantes já foram transferidos
        console.log('ChatInterface: Diamond transfer completed successfully despite message error')
      }

      // 3. Vincular a mensagem à transação (se a mensagem foi criada)
      if (transferResult.transaction_id && messageData?.id) {
        const { error: transactionUpdateError } = await supabase
          .from('transactions')
          .update({
            related_message_id: messageData.id
          })
          .eq('id', transferResult.transaction_id)

        if (transactionUpdateError) {
          console.error('ChatInterface: Error linking message to transaction:', transactionUpdateError)
        }
      }

      // 4. Atualizar estado local com os novos saldos
      setUserDiamonds(transferResult.sender_new_balance)
      setOtherProfile(prev => prev ? {
        ...prev,
        diamond_count: transferResult.receiver_new_balance
      } : null)

      // 5. Fechar modal e resetar formulário
      setShowDiamondModal(false)
      setDiamondAmount(1)

      // 6. Notificar componente pai que uma mensagem foi enviada
      if (onMessageSent) {
        onMessageSent()
      }
      
      // 7. Mostrar mensagem de sucesso
      alert(`✅ ${diamondAmount} diamantes enviados com sucesso para ${otherProfile.name}!`)

      console.log('ChatInterface: Diamond transfer completed successfully!')

    } catch (error) {
      console.error('Error sending diamonds:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao enviar diamantes: ${errorMessage}`)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 overflow-x-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Back button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            
            {/* Center - Profile info */}
            <motion.div 
              className="flex-1 mx-4 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewProfile(otherProfile.id)}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
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
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                {/* Name and rank info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5 mb-0.5">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">{otherProfile.name}</h2>
                    {otherProfile.is_premium && (
                      <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <img
                      src={getRankImageUrl(otherProfile.current_rank)}
                      alt={otherProfile.current_rank}
                      className="w-4 h-4 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-600 font-medium truncate">{otherProfile.current_rank}</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Right side - Menu button (optional) */}
            <div className="w-10 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReportModal(true)}
                className="p-2.5 bg-red-50 rounded-full hover:bg-red-100 transition-colors flex-shrink-0"
                title="Denunciar usuário"
              >
                <Flag className="w-5 h-5 text-red-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="pt-20 pb-32 overflow-y-auto p-4 min-h-screen touch-pan-y">
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
                      ? `${message.message_type === 'diamond' 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white ${
                          message.isOptimistic ? 'opacity-70' : ''
                        }`
                      : `${message.message_type === 'diamond' 
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800' 
                          : 'bg-white text-gray-800'} shadow-md`
                  }`}
                >
                  {message.message_type === 'diamond' ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">💎</span>
                      <span className="font-semibold">{message.diamond_count} diamantes</span>
                      <Gift className="w-4 h-4" />
                    </div>
                  ) : (
                    <p className="text-sm">{message.message_text}</p>
                  )}
                  <p className={`text-xs mt-1 ${
                    message.sender_id === user.id 
                      ? message.message_type === 'diamond' ? 'text-yellow-100' : 'text-blue-100'
                      : message.message_type === 'diamond' ? 'text-orange-600' : 'text-gray-500'
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
          {/* Diamond counter */}
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="text-base">💎</span>
              <span>Seus diamantes: {userDiamonds}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDiamondModal(true)}
              disabled={userDiamonds === 0}
              className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-sm font-medium hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Gift className="w-4 h-4" />
              <span>Enviar</span>
            </motion.button>
          </div>
          
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

      {/* Diamond Sending Modal */}
      <AnimatePresence>
        {showDiamondModal && (
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
              className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto my-auto"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💎</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Enviar Diamantes</h3>
                <p className="text-gray-600">Para {otherProfile?.name}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade de diamantes
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setDiamondAmount(Math.max(1, diamondAmount - 1))}
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <input
                      type="number"
                      value={diamondAmount}
                      onChange={(e) => setDiamondAmount(Math.max(1, Math.min(userDiamonds, parseInt(e.target.value) || 1)))}
                      className="w-full text-center text-2xl font-bold border-none outline-none"
                      min="1"
                      max={userDiamonds}
                    />
                    <div className="flex items-center justify-center space-x-1 text-yellow-500">
                      {[...Array(Math.min(5, diamondAmount))].map((_, i) => (
                        <span key={i} className="text-base">💎</span>
                      ))}
                      {diamondAmount > 5 && <span className="text-sm">+{diamondAmount - 5}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDiamondAmount(Math.min(userDiamonds, diamondAmount + 1))}
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Você tem {userDiamonds} diamantes disponíveis
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDiamondModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={sendDiamonds}
                  disabled={diamondAmount <= 0 || diamondAmount > userDiamonds || sending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>{sending ? 'Enviando...' : 'Enviar'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={otherProfile.id}
        reportedUserName={otherProfile.name}
        matchId={matchId}
      />
    </div>
  )
}