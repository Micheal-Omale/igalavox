import { defineStore } from 'pinia'
import { ref } from 'vue'
import { isSupabaseConfigured, supabase } from '../services/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (data) profile.value = data
  }

  async function initializeAuth() {
    if (!isSupabaseConfigured) {
      loading.value = false
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      user.value = session.user
      await fetchProfile(session.user.id)
    }
    
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        user.value = session.user
        await fetchProfile(session.user.id)
      } else {
        user.value = null
        profile.value = null
      }
    })
    loading.value = false
  }

  async function signIn(email, password) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured for this deployment.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    if (!isSupabaseConfigured) return

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const isAdmin = () => profile.value?.role === 'admin'

  return { user, profile, loading, initializeAuth, signIn, signOut, isAdmin }
})
