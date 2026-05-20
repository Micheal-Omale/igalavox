import { createClient } from '@supabase/supabase-js'

const cleanEnv = (value) => String(value || '').trim().replace(/^["']|["']$/g, '')

const supabaseUrl = cleanEnv(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = cleanEnv(import.meta.env.VITE_SUPABASE_ANON_KEY)
export const SUPABASE_CONFIG_MESSAGE = 'Supabase is not configured for this deployment.'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error('Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deploy environment.')
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(SUPABASE_CONFIG_MESSAGE)
  }

  return supabase
}
