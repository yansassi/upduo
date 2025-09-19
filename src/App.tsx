import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthForm } from './components/AuthForm'
import { ProfileSetup } from './components/ProfileSetup'
import { SwipeInterface } from './components/SwipeInterface'
import { MatchesList } from './components/MatchesList'
import { ProfileView } from './components/ProfileView'
import PremiumArea from './components/PremiumArea'
import { InaugurationEvent } from './components/InaugurationEvent'
import { ChatInterface } from './components/ChatInterface'
import { Navigation } from './components/Navigation'
import { supabase } from './lib/supabase'

function AppContent() {
  const { user, loading, error } = useAuth()
  const [hasProfile, setHasProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('discover')
  const [profileLoading, setProfileLoading] = useState(true)
  const [currentChatMatch, setCurrentChatMatch] = useState<string | null>(null)
  const [currentProfileToViewId, setCurrentProfileToViewId] = useState<string | null>(null)
  const [hasAnyUnreadMessages, setHasAnyUnreadMessages] = useState(false)
  const [matchesRefreshTrigger, setMatchesRefreshTrigger] = useState(0)
  const [isUserPremium, setIsUserPremium] = useState(false)

  useEffect(() => {
    console.log('AppContent: User state changed', { user, loading })
    checkProfile()
  }, [user])

  const checkProfile = async () => {
    console.log('AppContent: Checking profile for user', user?.id)
    if (!user) {
      console.log('AppContent: No user found, setting profileLoading to false')
      setProfileLoading(false)
      return
    }

    try {
      console.log('AppContent: Starting profile check query...')
      const { data, error, count } = await supabase
        .from('profiles')
        .select('id, is_premium')
        .eq('id', user.id)
        .maybeSingle()

      console.log('AppContent: Profile check result', { data, error, count, hasData: !!data })
      
      if (error) {
        console.error('AppContent: Profile check failed with unexpected error', error)
        console.log('AppContent: Signing out due to profile check error (possibly offline)')
        await signOut()
        setHasProfile(false)
        setIsUserPremium(false)
      } else {
        const profileExists = !!data
        console.log('AppContent: Profile exists:', profileExists)
        setHasProfile(profileExists)
        setIsUserPremium(data?.is_premium || false)
      }
    } catch (error) {
      console.error('AppContent: Profile check failed with exception', error)
      console.log('AppContent: Signing out due to profile check exception (possibly offline)')
      await signOut()
      setHasProfile(false)
      setIsUserPremium(false)
    } finally {
      console.log('AppContent: Setting profileLoading to false')
      setProfileLoading(false)
    }
  }

  const handleOpenChat = (matchId: string) => {
    console.log('App: Opening chat for match', matchId)
    setCurrentChatMatch(matchId)
    setCurrentProfileToViewId(null)
  }

  const handleCloseChat = () => {
    console.log('App: Closing chat')
    setCurrentChatMatch(null)
  }

  const handleMessageSent = () => {
    console.log('App: Message sent, refreshing matches list')
    setMatchesRefreshTrigger(prev => prev + 1)
  }

  const handleViewProfile = (profileId: string) => {
    console.log('App: Opening profile view for user', profileId)
    setCurrentProfileToViewId(profileId)
    setCurrentChatMatch(null)
  }

  const handleBackFromProfileView = () => {
    console.log('App: Closing profile view')
    setCurrentProfileToViewId(null)
  }

  // Show error state if there's an auth error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-700 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold mb-4">Erro de Conexão</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-red-800 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {loading ? 'Inicializando...' : 'Verificando perfil...'}
          </p>
          <p className="text-blue-200 text-sm mt-2">
            {user ? `Usuário: ${user.email}` : 'Aguardando autenticação...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (!hasProfile) {
    return <ProfileSetup />
  }

  // Show chat interface if a chat is open
  if (currentChatMatch) {
    return (
      <ChatInterface 
        matchId={currentChatMatch} 
        onBack={handleCloseChat}
        onViewProfile={handleViewProfile}
        onMessageSent={handleMessageSent}
      />
    )
  }

  // Show profile view if viewing another user's profile
  if (currentProfileToViewId) {
    return (
      <ProfileView 
        profileId={currentProfileToViewId}
        onBack={handleBackFromProfileView}
      />
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <SwipeInterface />
      case 'matches':
        return <MatchesList 
          onOpenChat={handleOpenChat} 
          onUnreadStatusChange={setHasAnyUnreadMessages}
          refreshTrigger={matchesRefreshTrigger}
        />
      case 'event':
        return <InaugurationEvent />
      case 'premium':
        return <PremiumArea />
      case 'profile':
        return <ProfileView 
          profileId={user?.id} 
          onGoToPremium={() => setActiveTab('premium')}
        />
      default:
        return <SwipeInterface />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderContent()}
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        hasAnyUnreadMessages={hasAnyUnreadMessages}
        isUserPremium={isUserPremium}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App