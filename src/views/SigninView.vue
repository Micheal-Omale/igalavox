<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../components/AppButton.vue'
import BrandLogo from '../components/BrandLogo.vue'

const imageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs9rs6AkcWOP-F0tR30ZWIm9Gkp2QQBYEBjfsDnNx5XtV51GJUC3pYwCuCybpoGGLSwb1kTH8c0Rgl0HZLumjFilPpy5m_2e8IP7-RI8Qnn-RHzz605Q_VL8u7sMwsnN10kdoNbrnMMEHPFtx9Rm4OGkEnbU4f-cnidZx5Y89iKrZmoSuHOSmDQHEKICHmFAyBH8EVzZXU97Imzgkc8HSSJATm4JogxhGAjtVXcdn7HhGMF9PxwKpq4BGS3yOS8z6rKqJQ6t7zs3hK'

import { useAuthStore } from '../stores/authStore'

const form = reactive({
  email: '',
  password: '',
})
const loading = ref(false)
const errorMsg = ref('')

const fieldClasses = 'block w-full rounded border border-surface-dim bg-surface-container-low px-4 py-3 font-body text-base text-on-surface placeholder:text-outline-variant outline-none transition-all focus:border-tertiary focus:ring-1 focus:ring-tertiary'
const router = useRouter()
const authStore = useAuthStore()

const handleSignIn = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    await authStore.signIn(form.email, form.password)
    router.push('/admin')
  } catch (error) {
    errorMsg.value = error.message || 'Login failed'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/')
}
</script>

<template>
  <main class="flex min-h-dvh w-full overflow-hidden bg-background text-on-background selection:bg-tertiary-container/30">
    <section class="relative hidden w-1/2 overflow-hidden bg-surface-container-high lg:flex">
      <div class="absolute inset-0 z-0">
        <img
          :src="imageUrl"
          alt="Digital artistry version of a traditional African mask with forest green and gold accents"
          class="h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
      </div>
      <div class="relative z-10 mt-auto p-10 text-on-primary xl:p-14">
        <blockquote class="mb-5 max-w-lg font-headline text-3xl font-semibold leading-tight xl:text-4xl">
          "Preserving the roots of our lineage for the branches of tomorrow."
        </blockquote>
        <div class="h-px w-12 bg-tertiary-fixed/60"></div>
      </div>
    </section>

    <section class="relative flex w-full items-center justify-center overflow-hidden px-5 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:w-1/2 lg:px-10 lg:py-8 xl:px-14">
      <div class="texture-bg absolute inset-0 opacity-[0.35]"></div>
      <div class="relative z-10 w-full max-w-[420px] space-y-8 lg:space-y-9">
        <button
          class="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-surface-container-lowest/80 px-4 py-2 font-label text-sm font-semibold tracking-[0.05em] text-secondary transition-colors hover:border-secondary/40 hover:text-primary"
          type="button"
          @click="goBack"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back</span>
        </button>

        <header class="space-y-3">
          <BrandLogo image-class="block h-12 w-auto max-w-none object-contain sm:h-14" />
          <p class="font-body text-base leading-relaxed text-on-surface-variant sm:text-lg">
            Welcome back. Please enter your details to access your family archives.
          </p>
        </header>

        <form class="space-y-5 sm:space-y-6" @submit.prevent="handleSignIn">
          <div v-if="errorMsg" class="rounded bg-error/10 p-3 text-sm text-error">
            {{ errorMsg }}
          </div>
          <div class="space-y-2">
            <label class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface" for="email">
              Email Address
            </label>
            <input
              id="email"
              v-model="form.email"
              :class="fieldClasses"
              name="email"
              placeholder="ilebaye@example.com"
              required
              type="email"
            />
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface" for="password">
                Password
              </label>
              <RouterLink class="font-body text-xs text-secondary transition-colors hover:text-primary hover:underline" to="/forgot-password">
                Forgot Password?
              </RouterLink>
            </div>
            <input
              id="password"
              v-model="form.password"
              :class="fieldClasses"
              name="password"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>

          <div class="pt-2 sm:pt-4">
            <AppButton as="button" type="submit" class="w-full py-4" :disabled="loading">
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </AppButton>
          </div>
        </form>

        <div class="border-t border-surface-dim pt-6 text-center">
          <p class="font-body text-base leading-relaxed text-on-surface-variant">
            Want to add a name?
            <RouterLink
              class="ml-1 font-label text-sm font-semibold tracking-[0.05em] text-secondary transition-colors hover:text-primary hover:underline"
              to="/contribute"
            >
              Contribute
            </RouterLink>
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
