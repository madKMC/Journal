import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmziewkrsrfkixdnuxtf.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5temlld2tyc3Jma2l4ZG51eHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTM0NDgsImV4cCI6MjA2NTI4OTQ0OH0.cctjupi2MF-jMSAiwrXBAKTRT-zIdLWmaNegIl3GjBg'

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)