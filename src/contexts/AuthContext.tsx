import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient, authStorage, User } from '../lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('AuthProvider: Initializing...')
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setError(null)
      
      // Verificar se há token armazenado
      const token = authStorage.getToken()
      const storedUser = authStorage.getUser()
      
      if (!token || !storedUser) {
        console.log('AuthProvider: No stored auth data found')
        setUser(null)
        setLoading(false)
        return
      }

      console.log('AuthProvider: Found stored auth data, verifying token...')
      
      // Verificar se o token ainda é válido
      const response = await apiClient.verifyToken()
      
      if (response.success && response.data) {
        console.log('AuthProvider: Token is valid, user authenticated')
        setUser(response.data)
        authStorage.setUser(response.data) // Atualizar dados do usuário
      } else {
        console.log('AuthProvider: Token is invalid, clearing auth data')
        authStorage.removeToken()
        setUser(null)
        setError(response.error || 'Sessão expirada')
      }
    } catch (error) {
      console.error('AuthProvider: Error during initialization:', error)
      authStorage.removeToken()
      setUser(null)
      setError('Erro ao verificar autenticação')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in', { email })
    setError(null)
    setLoading(true)

    try {
      const response = await apiClient.login(email, password)
      
      if (response.success && response.data) {
        console.log('AuthProvider: Sign in successful')
        
        // Armazenar token e dados do usuário
        authStorage.setToken(response.data.token)
        authStorage.setUser(response.data.user)
        
        setUser(response.data.user)
        setError(null)
        
        return { error: null }
      } else {
        console.error('AuthProvider: Sign in failed:', response.error)
        setError(response.error || 'Erro no login')
        return { error: { message: response.error || 'Erro no login' } }
      }
    } catch (error) {
      console.error('AuthProvider: Sign in exception:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign up', { email })
    setError(null)
    setLoading(true)

    try {
      const response = await apiClient.register(email, password)
      
      if (response.success && response.data) {
        console.log('AuthProvider: Sign up successful')
        
        // Armazenar token e dados do usuário
        authStorage.setToken(response.data.token)
        authStorage.setUser(response.data.user)
        
        setUser(response.data.user)
        setError(null)
        
        return { error: null }
      } else {
        console.error('AuthProvider: Sign up failed:', response.error)
        setError(response.error || 'Erro no cadastro')
        return { error: { message: response.error || 'Erro no cadastro' } }
      }
    } catch (error) {
      console.error('AuthProvider: Sign up exception:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    console.log('AuthProvider: Signing out')
    setError(null)
    
    try {
      // Tentar fazer logout no servidor (opcional)
      await apiClient.logout()
    } catch (error) {
      console.warn('AuthProvider: Server logout failed, continuing with local cleanup:', error)
    }
    
    // Limpar estado local
    authStorage.removeToken()
    setUser(null)
    setError(null)
    
    console.log('AuthProvider: Sign out completed')
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}