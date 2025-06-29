import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate that environment variables are defined
if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

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