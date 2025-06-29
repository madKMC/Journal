'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { processMonitor } from '@/lib/processMonitor'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 [AuthContext] Initializing authentication...')
    processMonitor.logMemoryUsage('Auth Context Init')

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('🚨 [AuthContext] Error getting initial session:', error)
      } else {
        console.log('✅ [AuthContext] Initial session retrieved:', session ? 'authenticated' : 'not authenticated')
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      processMonitor.logMemoryUsage('Auth Initial Session')
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AuthContext] Auth state changed:', event, session ? 'authenticated' : 'not authenticated')
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      processMonitor.logMemoryUsage(`Auth State Change: ${event}`)
    })

    return () => {
      console.log('🔐 [AuthContext] Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('📝 [AuthContext] Attempting sign up for:', email)
    processMonitor.logMemoryUsage('Before Sign Up')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        console.error('🚨 [AuthContext] Sign up error:', error.message)
      } else {
        console.log('✅ [AuthContext] Sign up successful for:', email)
      }

      processMonitor.logMemoryUsage('After Sign Up')
      return { error }
    } catch (error) {
      console.error('🚨 [AuthContext] Unexpected sign up error:', error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔑 [AuthContext] Attempting sign in for:', email)
    processMonitor.logMemoryUsage('Before Sign In')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('🚨 [AuthContext] Sign in error:', error.message)
      } else {
        console.log('✅ [AuthContext] Sign in successful for:', email)
      }

      processMonitor.logMemoryUsage('After Sign In')
      return { error }
    } catch (error) {
      console.error('🚨 [AuthContext] Unexpected sign in error:', error)
      return { error }
    }
  }

  const signOut = async () => {
    console.log('🚪 [AuthContext] Attempting sign out')
    processMonitor.logMemoryUsage('Before Sign Out')

    try {
      await supabase.auth.signOut()
      console.log('✅ [AuthContext] Sign out successful')
      processMonitor.logMemoryUsage('After Sign Out')
    } catch (error) {
      console.error('🚨 [AuthContext] Sign out error:', error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}