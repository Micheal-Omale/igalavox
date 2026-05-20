import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'fs'

function loadLocalEnv() {
  if (!existsSync('.env')) return

  const lines = readFileSync('.env', 'utf-8').split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
}

loadLocalEnv()

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log('Testing connection...')
  const { data, error } = await supabase.from('names').select('*').limit(1)
  console.log('Select:', data, error)
}

test()
