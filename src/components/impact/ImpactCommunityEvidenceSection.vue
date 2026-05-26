<script setup>
import AppButton from '../AppButton.vue'

const evidenceSignals = [
  {
    title: 'Link existing posts',
    body: 'Share public Facebook, TikTok, or YouTube links that already document what communities are facing.',
  },
  {
    title: 'Reviewed before publication',
    body: 'Each submission is checked before it becomes visible, helping the civic story record stay credible and useful.',
  },
  {
    title: 'Preserve real local voices',
    body: 'Approved evidence helps communities in Igala land and Kogi State remain visible in the public record.',
  },
]

const previewMeta = {
  community: 'Olamaboro Axis',
  category: 'Road Access',
  platform: 'YouTube Link',
}
</script>

<template>
  <section class="relative overflow-hidden bg-surface-container-low px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(254,202,168,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(188,237,215,0.16),_transparent_30%)]"></div>

    <Transition
      appear
      enter-active-class="transition duration-700 ease-out motion-reduce:transition-none"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
    >
      <div class="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div class="max-w-3xl">
          <p class="font-label text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Community Evidence</p>
          <h2 class="mt-4 font-headline text-3xl font-semibold leading-tight text-primary sm:text-4xl">
            Help Make Community Challenges Visible
          </h2>
          <p class="mt-5 max-w-2xl font-body text-base leading-8 text-on-surface-variant sm:text-lg">
            Share links to existing Facebook, TikTok, or YouTube posts that reveal what communities are living through, from flooding and poor roads to water scarcity, electricity failures, and other urgent realities.
          </p>
          <p class="mt-4 max-w-2xl font-body text-base leading-8 text-on-surface-variant">
            Every submission is reviewed before it is shown publicly. Approved evidence appears in dedicated archive and can also be published as its own standalone impact story.
          </p>

          <p class="mt-5 inline-flex rounded-full border border-secondary/15 bg-surface-container-lowest/85 px-4 py-2 font-body text-sm text-on-surface-variant shadow-[0_12px_30px_-24px_rgb(92_58_33_/_0.22)] backdrop-blur-sm">
            Share links to real community videos for archive and story publishing.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <AppButton to="/impact/evidence/submit">
              <span class="material-symbols-outlined text-[18px]">library_add</span>
              Submit Evidence
            </AppButton>
            <AppButton to="/impact/stories" variant="secondary">
              <span class="material-symbols-outlined text-[18px]">auto_stories</span>
              Browse Impact Stories
            </AppButton>
          </div>

          <div class="mt-10 grid gap-4 sm:grid-cols-3">
            <article
              v-for="signal in evidenceSignals"
              :key="signal.title"
              class="ambient-shadow rounded-[1.25rem] border border-outline-variant/20 bg-surface-container-lowest/90 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-28px_rgb(92_58_33_/_0.28)]"
            >
              <h3 class="font-headline text-xl font-semibold text-primary">{{ signal.title }}</h3>
              <p class="mt-3 font-body text-sm leading-7 text-on-surface-variant">{{ signal.body }}</p>
            </article>
          </div>
        </div>

        <div class="relative">
          <div class="absolute inset-x-6 inset-y-8 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(203,167,47,0.16),_transparent_40%),radial-gradient(circle_at_bottom,_rgba(124,86,59,0.12),_transparent_44%)] blur-2xl"></div>
          <article class="ambient-shadow relative overflow-hidden rounded-[2rem] border border-secondary/10 bg-surface-container-lowest/95 p-4 shadow-[0_30px_60px_-36px_rgb(92_58_33_/_0.3)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_36px_72px_-36px_rgb(92_58_33_/_0.34)] sm:p-5">
            <div class="rounded-[1.5rem] border border-outline-variant/20 bg-surface">
              <div class="flex items-center justify-between gap-3 border-b border-outline-variant/15 px-5 py-4">
                <div>
                  <p class="font-label text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Editorial Preview</p>
                  <p class="mt-1 font-body text-sm text-on-surface-variant">How approved evidence may appear inside archive.</p>
                </div>
                <span class="rounded-full border border-primary/10 bg-primary/5 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  Review Queue
                </span>
              </div>

              <div class="p-5 sm:p-6">
                <div class="relative overflow-hidden rounded-[1.5rem] border border-outline-variant/20 bg-[linear-gradient(145deg,_rgba(0,38,27,0.92),_rgba(11,61,46,0.78)_48%,_rgba(124,86,59,0.55))]">
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_48%)]"></div>
                  <div class="relative aspect-[4/3] px-5 py-5 sm:px-6 sm:py-6">
                    <div class="flex items-start justify-between gap-3">
                      <span class="rounded-full bg-white/10 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
                        {{ previewMeta.community }}
                      </span>
                      <span class="rounded-full bg-black/20 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
                        {{ previewMeta.platform }}
                      </span>
                    </div>

                    <div class="mt-6 flex h-[calc(100%-4rem)] flex-col justify-between">
                      <div>
                        <span class="inline-flex rounded-full bg-secondary-container/90 px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-on-secondary-container">
                          {{ previewMeta.category }}
                        </span>
                        <p class="mt-4 max-w-sm font-headline text-2xl font-semibold leading-tight text-white sm:text-[1.75rem]">
                          Standalone evidence documenting washed-out roads after heavy rainfall.
                        </p>
                      </div>

                      <div class="flex items-end justify-between gap-4">
                        <p class="max-w-xs font-body text-sm leading-6 text-white/80">
                          Public video link submitted to help preserve local testimony and civic context.
                        </p>
                        <div class="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition-transform duration-300 hover:scale-105">
                          <span class="material-symbols-outlined text-4xl text-white">play_arrow</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-5 grid gap-3 sm:grid-cols-3">
                  <div class="rounded-[1rem] border border-outline-variant/15 bg-surface-container-low px-4 py-3">
                    <p class="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">Source</p>
                    <p class="mt-2 font-body text-sm text-on-surface">Public YouTube link</p>
                  </div>
                  <div class="rounded-[1rem] border border-outline-variant/15 bg-surface-container-low px-4 py-3">
                    <p class="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">Status</p>
                    <p class="mt-2 font-body text-sm text-on-surface">Pending verification</p>
                  </div>
                  <div class="rounded-[1rem] border border-outline-variant/15 bg-surface-container-low px-4 py-3">
                    <p class="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">Purpose</p>
                    <p class="mt-2 font-body text-sm text-on-surface">Publish as evidence post</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </Transition>
  </section>
</template>
