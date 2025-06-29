import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = 'https://nmziewkrsrfkixdnuxtf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5temlld2tyc3Jma2l4ZG51eHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTM0NDgsImV4cCI6MjA2NTI4OTQ0OH0.cctjupi2MF-jMSAiwrXBAKTRT-zIdLWmaNegIl3GjBg'

console.log('🔗 [Supabase] Initializing Supabase client:', {
  url: supabaseUrl,
  keyPrefix: supabaseKey.substring(0, 20) + '...',
  timestamp: new Date().toISOString()
})

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'my-journal-app'
    }
  }
})

// Add logging for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 [Supabase] Auth state changed:', {
    event,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    timestamp: new Date().toISOString()
  })
})

console.log('✅ [Supabase] Client initialized successfully')