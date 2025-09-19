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
  const [initializationComplete, setInitializationComplete] = useState(false)

  // Function to update user activity when user logs in
  const updateUserActivity = async (userId: string) => {
    try {
      console.log('AuthProvider: Updating user activity for user', userId)
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('User activity update timeout')), 5000)
      })
      
      const updatePromise = supabase
        .from('user_activity')
        .upsert({
          user_id: userId,
          last_login: new Date().toISOString(),
          total_logins: 1, // This will be handled by the database trigger
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
      
      const { error } = await Promise.race([updatePromise, timeoutPromise])

      if (error) {
        console.error('AuthProvider: Error updating user activity:', error)
      } else {
        console.log('AuthProvider: User activity updated successfully')
      }
    } catch (error) {
      console.error('AuthProvider: Exception updating user activity:', error)
      // Don't let user activity update failure block the auth flow
    }
  }

  useEffect(() => {
    console.log('AuthProvider: Initializing...')
    
    // Set a maximum timeout for initialization
    const initTimeout = setTimeout(() => {
      console.warn('AuthProvider: Initialization timeout reached, forcing completion')
      if (!initializationComplete) {
        setLoading(false)
        setError('Authentication initialization timeout')
        setInitializationComplete(true)
      }
    }, 10000) // 10 second timeout
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('AuthProvider: Initial session check', { session, error })
      
      if (error) {
        console.error('AuthProvider: Session error', error)
        setError(error.message)
      } else {
        setError(null) // Clear any previous errors
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      
      // Update user activity for initial session if user exists
      if (session?.user) {
        // Don't await this to prevent blocking
        updateUserActivity(session.user.id).catch(err => {
          console.warn('AuthProvider: Failed to update user activity on init:', err)
        })
      }
      
      console.log('AuthProvider: Setting loading to false after session check')
      clearTimeout(initTimeout)
      setInitializationComplete(true)
      setLoading(false)
    }).catch((err) => {
      console.error('AuthProvider: Failed to get session', err)
      setError('Failed to initialize authentication')
      clearTimeout(initTimeout)
      setInitializationComplete(true)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed', { event, session })
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Clear errors on successful auth state change
        if (session) {
          setError(null)
        }
        
        // Update user activity on sign in or initial session
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          console.log('AuthProvider: User signed in or session restored, updating activity')
          // Don't await this to prevent blocking the auth flow
          updateUserActivity(session.user.id).catch(err => {
            console.warn('AuthProvider: Failed to update user activity on auth change:', err)
          })
        }
        
        // Only set loading to false if initialization is complete
        if (event !== 'INITIAL_SESSION' && initializationComplete) {
          console.log('AuthProvider: Setting loading to false after auth state change')
          setLoading(false)
        }
      }
    )

    return () => {
      clearTimeout(initTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in', { email })
    setError(null) // Clear any previous errors
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('AuthProvider: Sign in error', error)
      setError(error.message)
    }
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign up', { email })
    setError(null) // Clear any previous errors
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('AuthProvider: Sign up error', error)
      setError(error.message)
    }
    return { error }
  }

  const signOut = async () => {
    console.log('AuthProvider: Signing out')
    setError(null) // Clear any previous errors
    
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