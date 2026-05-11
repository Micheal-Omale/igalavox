<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../components/AppButton.vue'
import BrandLogo from '../components/BrandLogo.vue'

const receiverEmail = import.meta.env.VITE_CONTRIBUTION_EMAIL
const imageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs9rs6AkcWOP-F0tR30ZWIm9Gkp2QQBYEBjfsDnNx5XtV51GJUC3pYwCuCybpoGGLSwb1kTH8c0Rgl0HZLumjFilPpy5m_2e8IP7-RI8Qnn-RHzz605Q_VL8u7sMwsnN10kdoNbrnMMEHPFtx9Rm4OGkEnbU4f-cnidZx5Y89iKrZmoSuHOSmDQHEKICHmFAyBH8EVzZXU97Imzgkc8HSSJATm4JogxhGAjtVXcdn7HhGMF9PxwKpq4BGS3yOS8z6rKqJQ6t7zs3hK'

const router = useRouter()
const statusMessage = ref('')

const form = reactive({
  fullName: '',
  email: '',
  nameToAdd: '',
  meaning: '',
  pronunciation: '',
  story: '',
})

const fieldClasses = 'block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 font-body text-base text-on-surface shadow-sm outline-none transition-colors placeholder:text-outline-variant focus:border-tertiary focus:ring-1 focus:ring-tertiary'

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/')
}

const submitContribution = () => {
  if (!receiverEmail) {
    statusMessage.value = 'Contribution email is not configured.'
    return
  }

  const subject = `Igala name contribution: ${form.nameToAdd}`
  const body = [
    'New name contribution',
    '',
    `Contributor: ${form.fullName}`,
    `Email: ${form.email}`,
    '',
    `Name to add: ${form.nameToAdd}`,
    `Meaning: ${form.meaning || 'Not provided'}`,
    `Pronunciation: ${form.pronunciation || 'Not provided'}`,
    '',
    'Story / extra context:',
    form.story || 'Not provided',
  ].join('\n')

  const mailtoUrl = `mailto:${receiverEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = mailtoUrl
  statusMessage.value = 'Email draft opened. Send it from your mail app to complete contribution.'
}
</script>

<template>
  <main class="relative z-10 flex min-h-dvh w-full flex-grow items-center justify-center overflow-hidden px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
    <section class="ambient-shadow flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-secondary/10 bg-surface-container-lowest md:flex-row">
      <div class="relative hidden w-full overflow-hidden bg-primary md:block md:w-5/12">
        <img
          :src="imageUrl"
          alt="Digital artwork of Igala heritage"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-primary-container/90 via-primary/10 to-transparent"></div>
        <div class="relative flex h-full min-h-[640px] flex-col justify-end p-8 text-on-primary lg:p-10">
          <h1 class="mb-4 font-display text-4xl font-bold leading-tight lg:text-5xl">
            Contribute a Name.
          </h1>
          <p class="max-w-sm font-body text-lg leading-relaxed text-on-primary/90">
            Share a name, meaning, pronunciation, and story so it can be reviewed for the archive.
          </p>
        </div>
      </div>

      <div class="flex w-full flex-col justify-center bg-surface-container-lowest p-6 md:w-7/12 md:p-8 lg:p-10">
        <div class="mb-8 flex items-center justify-between gap-4">
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
          <div class="mb-7 text-center md:text-left">
            <h2 class="mb-2 font-headline text-3xl font-semibold text-primary">Contribute to the Archive</h2>
          </div>

          <form class="space-y-5" @submit.prevent="submitContribution">
            <label class="block space-y-2">
              <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Your Full Name</span>
              <input v-model="form.fullName" :class="fieldClasses" required placeholder="e.g. Attah Ayegba" type="text" />
            </label>

            <label class="block space-y-2">
              <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Your Email</span>
              <input v-model="form.email" :class="fieldClasses" required placeholder="you@example.com" type="email" />
            </label>

            <label class="block space-y-2">
              <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Name to Add</span>
              <input v-model="form.nameToAdd" :class="fieldClasses" required placeholder="e.g. Ojonugwa" type="text" />
            </label>

            <label class="block space-y-2">
              <span class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface">Meaning</span>
              <input v-model="form.meaning" :class="fieldClasses" placeholder="Name meaning" type="text" />
            </label>

            <AppButton as="button" type="submit" class="w-full py-4">
              Contribute
              <span class="material-symbols-outlined text-[18px]">send</span>
            </AppButton>
          </form>

          <p v-if="statusMessage" class="mt-4 rounded-lg border border-secondary-container bg-secondary-container/20 px-4 py-3 font-body text-sm text-secondary">
            {{ statusMessage }}
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
