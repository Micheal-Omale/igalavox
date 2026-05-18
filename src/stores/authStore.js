import { defineStore } from 'pinia'
import { ref } from 'vue'
import { isSupabaseConfigured, supabase } from '../services/supabase'

let initPromise = null
let authSubscription = null

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)
  const initialized = ref(false)

  async function fetchProfile(userId) {
    if (!isSupabaseConfigured || !userId) {
      profile.value = null
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    profile.value = data || null
  }

  async function initializeAuth() {
    if (initialized.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      if (!isSupabaseConfigured) {
        loading.value = false
        initialized.value = true
        return
      }

      loading.value = true

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          user.value = session.user
          await fetchProfile(session.user.id)
        } else {
          user.value = null
          profile.value = null
        }

        if (!authSubscription) {
          const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
            try {
              if (nextSession?.user) {
                user.value = nextSession.user
                await fetchProfile(nextSession.user.id)
              } else {
                user.value = null
                profile.value = null
              }
            } catch (error) {
              console.error('Failed to refresh auth state:', error)
            }
          })
          authSubscription = data.subscription
        }
      } finally {
        loading.value = false
        initialized.value = true
        initPromise = null
      }
    })()

    return initPromise
  }

  async function signIn(email, password) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured for this deployment.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    if (data.user?.id) {
      await fetchProfile(data.user.id)
    }

    return data
  }

  async function signOut() {
    if (!isSupabaseConfigured) return

    const { error } = await supabase.auth.signOut()
    if (error) throw error

    user.value = null
    profile.value = null
  }

  const isAdmin = () => profile.value?.role === 'admin'

  return { user, profile, loading, initialized, initializeAuth, signIn, signOut, isAdmin }
})
