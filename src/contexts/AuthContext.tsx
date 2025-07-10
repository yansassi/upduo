import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
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
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('AuthProvider: Initializing...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthProvider: Initial session check', { session, error })
      if (error) {
        console.error('AuthProvider: Session error', error)
        setError(error.message)
      }
      setSession(session)
      setUser(session?.user ?? null)
      console.log('AuthProvider: Setting loading to false after session check')
      setLoading(false)
    }).catch((err) => {
      console.error('AuthProvider: Failed to get session', err)
      setError('Failed to initialize authentication')
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed', { event, session })
        setSession(session)
        setUser(session?.user ?? null)
        if (event !== 'INITIAL_SESSION') {
          console.log('AuthProvider: Setting loading to false after auth state change')
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in', { email })
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error('AuthProvider: Sign in error', error)
    }
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign up', { email })
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      console.error('AuthProvider: Sign up error', error)
    }
    return { error }
  }

  const signOut = async () => {
    console.log('AuthProvider: Signing out')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        // Handle session not found errors gracefully - this is expected when session is already invalid
        if (error.message?.includes('Session from session_id claim in JWT does not exist') || 
            error.status === 403) {
          console.warn('AuthProvider: Session already invalid on server, continuing with local cleanup')
        } else {
          console.warn('AuthProvider: Sign out error (continuing with local cleanup)', error)
        }
      }
      console.log('AuthProvider: Sign out completed successfully')
    } catch (error) {
      console.warn('AuthProvider: Sign out failed with exception, continuing with local cleanup', error)
    }
    
    // Force local state cleanup regardless of server response
    setUser(null)
    setSession(null)
    setError(null)
  }

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}