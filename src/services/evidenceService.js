import { isSupabaseConfigured, supabase } from './supabase'

function requireSupabase() {
  if (!supabase) throw new Error('Supabase client is not initialized.')
  return supabase
}

function isMissingTableError(error, tableName) {
  return error && error.code === '42P01' && error.message.includes(`"${tableName}"`)
}

export const EVIDENCE_CATEGORIES = [
  { id: 'infrastructure', label: 'Infrastructure & Roads', icon: 'construction' },
  { id: 'environment', label: 'Flooding & Environment', icon: 'water_drop' },
  { id: 'utilities', label: 'Electricity & Water', icon: 'bolt' },
  { id: 'culture', label: 'Culture & Events', icon: 'celebration' },
  { id: 'general', label: 'General Happening', icon: 'public' }
]

export function getCategoryMeta(id) {
  return EVIDENCE_CATEGORIES.find(c => c.id === id) || { id: 'general', label: 'General', icon: 'public' }
}

export async function fetchEvidence(filters = {}, admin = false) {
  if (!isSupabaseConfigured) return []
  
  const client = requireSupabase()
  let query = client.from('community_evidence').select('*')
  
  if (!admin) {
    query = query.eq('approved', true)
  }
  
  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }
  
  if (filters.lga && filters.lga !== 'all') {
    query = query.eq('lga', filters.lga)
  }
  
  if (filters.platform && filters.platform !== 'all') {
    query = query.eq('media_type', filters.platform)
  }

  // search title/desc/community
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,community_name.ilike.%${filters.search}%`)
  }
  
  // order by featured first if public, then created_at
  if (!admin) {
    query = query.order('featured', { ascending: false })
  }
  query = query.order('created_at', { ascending: false })
  
  const { data, error } = await query
  if (isMissingTableError(error, 'community_evidence')) return []
  if (error) throw error
  return data || []
}

export async function submitEvidence(payload) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  
  const client = requireSupabase()
  const { data, error } = await client
    .from('community_evidence')
    .insert({
      title: payload.title || null,
      description: payload.description,
      media_url: payload.media_url,
      media_type: payload.media_type,
      category: payload.category,
      community_name: payload.community_name || null,
      lga: payload.lga || null,
      approved: false,
      featured: false
    })
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function updateEvidenceStatus(id, updates) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  
  const client = requireSupabase()
  const { error } = await client
    .from('community_evidence')
    .update(updates)
    .eq('id', id)
    
  if (error) throw error
}

export async function deleteEvidence(id) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  
  const client = requireSupabase()
  const { data, error } = await client
    .from('community_evidence')
    .delete()
    .eq('id', id)
    .select()
    
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Item not found or you do not have permission to delete it from Supabase.')
  }
}
