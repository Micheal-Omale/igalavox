import { ref } from 'vue'
import fallbackNames from '../data/igala_names_with_tones.json'
import { isSupabaseConfigured, requireSupabase, SUPABASE_CONFIG_MESSAGE } from '../services/supabase'
import { normalizeNameRecord, toNameWritePayload } from '../utils/nameRecord'

export function useNames() {
  const names = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchNames = async () => {
    loading.value = true
    error.value = null

    if (!isSupabaseConfigured) {
      names.value = fallbackNames.map(normalizeNameRecord)
      loading.value = false
      return
    }

    const client = requireSupabase()
    const { data, error: err } = await client
      .from('names')
      .select(`
        *,
        audio_files(file_url, file_name)
      `)
      .order('name', { ascending: true })

    if (err) error.value = err
    else names.value = (data || []).map(normalizeNameRecord)
    loading.value = false
  }

  const createName = async (nameData) => {
    loading.value = true
    error.value = null
    if (!isSupabaseConfigured) {
      const err = new Error(SUPABASE_CONFIG_MESSAGE)
      error.value = err
      loading.value = false
      return { data: null, err }
    }

    const client = requireSupabase()
    const payload = toNameWritePayload(nameData)
    const { data, error: err } = await client.from('names').insert(payload).select(`*, audio_files(file_url, file_name)`).single()
    if (err) error.value = err
    else names.value.push(normalizeNameRecord(data))
    loading.value = false
    return { data, err }
  }

  const updateName = async (id, nameData) => {
    loading.value = true
    error.value = null
    if (!isSupabaseConfigured) {
      const err = new Error(SUPABASE_CONFIG_MESSAGE)
      error.value = err
      loading.value = false
      return { data: null, err }
    }

    const client = requireSupabase()
    const payload = toNameWritePayload(nameData)
    const { data, error: err } = await client.from('names').update(payload).eq('id', id).select(`*, audio_files(file_url, file_name)`).single()
    if (err) error.value = err
    else {
      const index = names.value.findIndex(n => n.id === id)
      if (index !== -1) names.value[index] = normalizeNameRecord(data)
    }
    loading.value = false
    return { data, err }
  }

  const deleteName = async (id) => {
    loading.value = true
    error.value = null
    if (!isSupabaseConfigured) {
      const err = new Error(SUPABASE_CONFIG_MESSAGE)
      error.value = err
      loading.value = false
      return { err }
    }

    const client = requireSupabase()
    const { error: err } = await client.from('names').delete().eq('id', id)
    if (err) error.value = err
    else names.value = names.value.filter(n => n.id !== id)
    loading.value = false
    return { err }
  }

  return { names, loading, error, fetchNames, createName, updateName, deleteName }
}
