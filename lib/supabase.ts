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
      'X-Client-Info': 'soulscript-journal-app'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
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

// Test connection on initialization - wrap with Promise.resolve to ensure proper Promise type
Promise.resolve(supabase.from('journal_entries').select('count', { count: 'exact', head: true }))
  .then(({ error }) => {
    if (error) {
      console.error('❌ [Supabase] Connection test failed:', error)
    } else {
      console.log('✅ [Supabase] Connection test successful')
    }
  })
  .catch((error) => {
    console.error('❌ [Supabase] Connection test error:', error)
  })

console.log('✅ [Supabase] Client initialized successfully')