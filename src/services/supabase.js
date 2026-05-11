import { createClient } from '@supabase/supabase-js'

const cleanEnv = (value) => String(value || '').trim().replace(/^["']|["']$/g, '')
const maskKey = (value) => value ? `${value.slice(0, 14)}...${value.slice(-6)}` : 'missing'

const supabaseUrl = cleanEnv(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = cleanEnv(import.meta.env.VITE_SUPABASE_ANON_KEY)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error('Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deploy environment.')
} else {
  console.info(`Supabase config loaded: ${supabaseUrl}, key ${maskKey(supabaseAnonKey)}`)
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
