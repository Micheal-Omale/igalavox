<script setup>
import AppButton from '../components/AppButton.vue'
import HeritageDivider from '../components/HeritageDivider.vue'

const missionImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBalwCP4CoBqq70cRnCpmgbsYT1dybQ_3CBQU7J_b-i1V5Ih_r-bWY2GtAMaNAfM_OKi9OKa2lzP2Ed-bErS_yts4tjNVJceP_AoLZI4MevCHS2jrLgIqB3e9tik7qAOLQGq0ly8MY_8PVktMbDGarmr0JcULe5dkO1sWca7Fo8WSb280ILlnRZTMfpFbCprsOt3O9TP4w09_knuOUMrg-cljO_ctC55yXvp-BA9jOXW_5nA5V7VAaOsTR9TjMQ9JAknWm1_W2lcRrc'

const contributors = [
  {
    initials: 'DA',
    name: 'Dr. Ayegba Ralphael Agbali',
    role: 'Medical Doctor & Top Contributor',
    tone: 'bg-primary-container text-on-primary',
    body: 'An active contributor and medical professional, he is deeply committed to the development of Igala land. He has been instrumental in transforming complex oral histories into structured linguistic frameworks, laying the foundation for our digital categorization.',
  },
  {
    initials: 'OM',
    name: 'Omale Oneh Michael',
    role: 'Agriculturist & Software Engineer',
    tone: 'bg-tertiary-container text-on-tertiary-fixed',
    body: 'A software engineer and proud son of Igala land, he is dedicated to preserving and advancing Igala heritage through technology, building digital platforms that transform culture, language, and identity into accessible living experiences.',
  },
]
</script>

<template>
  <main class="flex-grow overflow-x-hidden">
    <section class="relative mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
      <div class="absolute inset-6 -z-10 scale-105 rounded-xl bg-surface-container/60 blur-3xl"></div>
      <p class="mb-4 font-label text-sm font-semibold uppercase tracking-[0.22em] text-tertiary">
        About the Archive
      </p>
      <h1 class="mx-auto mb-6 max-w-4xl font-display text-5xl font-bold leading-tight text-primary md:text-[48px]">
        Preserving the Soul of Igala
      </h1>
      <p class="mx-auto max-w-3xl font-body text-lg leading-relaxed text-on-surface-variant">
        In every name lies a story, a lineage, and a profound connection to the earth. We are a digital archive dedicated to ensuring the voices of our ancestors continue to echo in the modern era.
      </p>
    </section>

    <HeritageDivider />

    <section class="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
      <div class="ambient-shadow overflow-hidden rounded-lg border border-secondary/10 bg-surface-container-lowest">
        <img
          :src="missionImage"
          alt="Warm sunlight illuminating woven natural fibers and dried leaves"
          class="aspect-square h-full w-full object-cover md:aspect-[4/5]"
        />
      </div>
      <div>
        <h2 class="mb-5 font-headline text-3xl font-semibold leading-tight text-primary">
          Bridging Oral Tradition and Digital Preservation
        </h2>
        <div class="space-y-5 font-body text-base leading-relaxed text-on-surface-variant">
          <p>
            For centuries, the Igala people have passed down history through spoken word, embedding our values and beliefs into the very names we give our children. Our mission is to construct a bridge between this rich oral tradition and the permanence of digital preservation.
          </p>
          <p>
            We meticulously document, translate, and contextualize names, ensuring that cultural heritage is not lost to time but remains accessible to generations to come.
          </p>
        </div>
      </div>
    </section>

    <HeritageDivider />

    <section class="my-16 bg-surface-container-low px-6 py-20">
      <div class="mx-auto max-w-4xl text-center">
        <span class="material-symbols-outlined mb-4 text-4xl text-tertiary">format_quote</span>
        <h3 class="mb-8 font-headline text-2xl font-semibold italic leading-snug text-primary">
          A name is not merely a label; it is a prophecy, a prayer, and a profound record of human experience.
        </h3>
        <p class="font-body text-base leading-relaxed text-on-surface-variant">
          In Igala culture, naming is a sacred act. A name can commemorate an event, honor an ancestor, or express deep philosophical truths. By preserving these names, we preserve the worldview of our people.
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-20">
      <div class="mx-auto mb-16 max-w-2xl text-center">
        <h2 class="mb-4 font-headline text-3xl font-semibold text-primary">
          Honoring Our Scholars and Contributors
        </h2>
        <p class="font-body text-base leading-relaxed text-on-surface-variant">
          This archive is built upon the tireless research and dedication of scholars and contributors who document Igala heritage.
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <article
          v-for="contributor in contributors"
          :key="contributor.name"
          class="ambient-shadow rounded-lg border border-secondary/15 bg-surface-container-lowest p-8 transition-shadow duration-300 hover:shadow-[0_12px_28px_rgb(92_58_33_/_0.12)]"
        >
          <div class="mb-5 flex items-center gap-4">
            <div :class="['flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-headline text-xl font-semibold', contributor.tone]">
              {{ contributor.initials }}
            </div>
            <div>
              <h3 class="font-headline text-2xl font-semibold leading-tight text-primary">
                {{ contributor.name }}
              </h3>
              <p class="font-body text-xs text-secondary">{{ contributor.role }}</p>
            </div>
          </div>
          <p class="font-body text-base leading-relaxed text-on-surface-variant">
            {{ contributor.body }}
          </p>
        </article>
      </div>
    </section>

    <section class="mx-auto max-w-3xl px-6 py-20 text-center">
      <div class="relative overflow-hidden rounded-xl bg-primary-container p-10 text-on-primary shadow-[0_20px_40px_-20px_rgb(11_61_46_/_0.4)] md:p-16">
        <div class="absolute right-0 top-0 h-64 w-64 -translate-y-24 translate-x-24 rounded-full bg-primary/50 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 h-48 w-48 -translate-x-20 translate-y-20 rounded-full bg-primary/50 blur-3xl"></div>
        <div class="relative z-10">
          <h2 class="mb-4 font-headline text-3xl font-semibold">Contribute to the Archive</h2>
          <p class="mb-8 font-body text-base leading-relaxed text-primary-fixed">
            Ensure your lineage is remembered. Contribute names, share stories, and explore the vast heritage of the Igala people.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <AppButton to="/contribute" variant="primary" class=" !text-on-tertiary-fixed !border-primary-fixed !bg-tertiary-fixed">
              Contribute a Name
            </AppButton>
            <AppButton to="/names" variant="secondary" class="hover:text-on-tertiary-fixed !text-primary-fixed !border-primary-fixed hover:!bg-tertiary-fixed">
              Explore the Archive
            </AppButton>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
