<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../components/AppButton.vue'
import BrandLogo from '../components/BrandLogo.vue'
import FormField from '../components/FormField.vue'

const imageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs9rs6AkcWOP-F0tR30ZWIm9Gkp2QQBYEBjfsDnNx5XtV51GJUC3pYwCuCybpoGGLSwb1kTH8c0Rgl0HZLumjFilPpy5m_2e8IP7-RI8Qnn-RHzz605Q_VL8u7sMwsnN10kdoNbrnMMEHPFtx9Rm4OGkEnbU4f-cnidZx5Y89iKrZmoSuHOSmDQHEKICHmFAyBH8EVzZXU97Imzgkc8HSSJATm4JogxhGAjtVXcdn7HhGMF9PxwKpq4BGS3yOS8z6rKqJQ6t7zs3hK'

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  purpose: '',
})

const purposeOptions = [
  { label: 'Diaspora Member', value: 'diaspora' },
  { label: 'Researcher / Scholar', value: 'researcher' },
  { label: 'Parent Documenting Lineage', value: 'parent' },
  { label: 'Cultural Enthusiast', value: 'enthusiast' },
]

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/')
}
</script>

<template>
  <main class="relative z-10 flex min-h-dvh w-full flex-grow items-center justify-center overflow-hidden px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
    <section class="ambient-shadow flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-secondary/10 bg-surface-container-lowest md:max-h-[calc(100dvh-2rem)] md:flex-row">
      <div class="relative hidden w-full overflow-hidden bg-primary md:block md:w-5/12">
        <img
          :src="imageUrl"
          alt="Digital artistry version of a traditional African mask with deep forest green and warm gold accents"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-primary-container/90 via-primary/10 to-transparent"></div>
        <div class="relative flex h-full flex-col justify-end p-8 text-on-primary lg:p-10">
          <h1 class="mb-4 font-display text-4xl font-bold leading-tight lg:text-5xl">
            Preserving Lineage.
          </h1>
          <p class="max-w-sm font-body text-lg leading-relaxed text-on-primary/90">
            Join our digital archive to document, explore, and celebrate the rich heritage of the Igala people.
          </p>
        </div>
      </div>

      <div class="flex w-full flex-col justify-center bg-surface-container-lowest p-6 md:w-7/12 md:p-8 lg:p-10">
        <div class="mb-8 flex items-center justify-between gap-4 md:mb-10">
          <button
            class="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-surface-container-lowest/80 px-4 py-2 font-label text-sm font-semibold tracking-[0.05em] text-secondary transition-colors hover:border-secondary/40 hover:text-primary"
            type="button"
            @click="goBack"
          >
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back</span>
          </button>

          <BrandLogo
            class="md:hidden"
            image-class="block h-9 w-auto max-w-none object-contain"
          />
        </div>

        <div class="mx-auto w-full max-w-md">
          <div class="mb-8 text-center md:mb-9 md:text-left">
            <h2 class="mb-2 font-headline text-3xl font-semibold text-primary">Create Account</h2>
            <p class="font-body text-base leading-relaxed text-on-surface-variant">
              Begin your journey into ancestral preservation.
            </p>
          </div>

          <form class="space-y-5" @submit.prevent>
            <FormField
              id="fullName"
              v-model="form.fullName"
              icon="person"
              label="Full Name"
              placeholder="e.g. Attah Ayegba"
            />
            <FormField
              id="email"
              v-model="form.email"
              icon="mail"
              label="Email Address"
              placeholder="idoko@example.com"
              type="email"
            />
            <FormField
              id="password"
              v-model="form.password"
              icon="lock"
              label="Password"
              placeholder="••••••••"
              type="password"
            />
            <FormField
              id="purpose"
              v-model="form.purpose"
              icon="explore"
              label="Why are you joining?"
              placeholder="Select your primary interest"
              :options="purposeOptions"
            />

            <div class="pt-2 sm:pt-3">
              <AppButton as="button" type="submit" class="w-full py-4">
                Create Account
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </AppButton>
            </div>
          </form>

          <div class="mt-6 border-t border-clay/20 pt-6 text-center">
            <p class="font-body text-base leading-relaxed text-on-surface-variant">
              Already preserving lineage?
              <RouterLink
                class="ml-1 font-label text-sm font-semibold tracking-[0.05em] text-tertiary underline decoration-tertiary/30 transition-colors hover:text-primary hover:decoration-primary"
                to="/signin"
              >
                Sign In
              </RouterLink>
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
