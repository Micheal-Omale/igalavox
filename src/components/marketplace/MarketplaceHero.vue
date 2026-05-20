<script setup>
import achiImage from '@/assets/pics/achi.jpg'
import AppButton from '../AppButton.vue'

defineProps({
  featuredCount: {
    type: Number,
    default: 0,
  },
  artisanCount: {
    type: Number,
    default: 0,
  },
})
</script>

<template>
  <section class="overflow-hidden border-b border-secondary/10 bg-[radial-gradient(circle_at_top_left,_rgba(254,202,168,0.28),_transparent_34%),linear-gradient(135deg,_rgba(252,249,244,1),_rgba(240,237,233,0.96)_42%,_rgba(188,237,215,0.28)_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
    <div class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div class="max-w-3xl">
        <p class="font-label text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Igala Cultural Marketplace</p>
        <h1 class="mt-4 font-display text-4xl font-bold leading-tight text-primary sm:text-5xl lg:text-6xl">
          Discover the craftsmanship of Igala culture
        </h1>
        <p class="mt-5 max-w-2xl font-body text-lg leading-8 text-on-surface-variant">
          Explore handcrafted products, heritage-centered books, contemporary adornment, and cultural objects shaped by artisan memory, preservation, and pride.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <AppButton href="#marketplace-grid">Explore Marketplace</AppButton>
          <AppButton to="/signin?redirect=/admin/marketplace" variant="secondary">Vendor Access</AppButton>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-3">
          <article class="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/80 p-4 shadow-sm backdrop-blur-sm">
            <p class="font-label text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Curated Listings</p>
            <p class="mt-3 font-display text-2xl font-bold text-primary">{{ featuredCount }}</p>
          </article>
          <article class="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/80 p-4 shadow-sm backdrop-blur-sm">
            <p class="font-label text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Artisans</p>
            <p class="mt-3 font-display text-2xl font-bold text-primary">{{ artisanCount }}</p>
          </article>
          <article class="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/80 p-4 shadow-sm backdrop-blur-sm">
            <p class="font-label text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Focus</p>
            <p class="mt-3 font-body text-sm leading-7 text-on-surface-variant">Story, authenticity, and cultural continuity over noisy retail</p>
          </article>
        </div>
      </div>

      <div class="relative">
        <div class="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(203,167,47,0.18),_transparent_42%)]"></div>
        <div class="relative grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
          <article class="overflow-hidden rounded-[2rem] border border-secondary/10 bg-surface-container-lowest shadow-[0_24px_48px_-28px_rgb(92_58_33_/_0.28)]">
            <img
              alt="Igala textile craft"
              class="h-72 w-full object-cover sm:h-[26rem]"
              loading="eager"
              :src="achiImage"
            />
            <div class="border-t border-outline-variant/15 bg-surface-container-low px-5 py-4">
              <p class="font-label text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Featured Craft</p>
              <p class="mt-2 font-headline text-xl font-semibold text-primary">Editorial commerce rooted in heritage</p>
            </div>
          </article>

          <div class="grid gap-4">
            <article class="overflow-hidden rounded-[1.75rem] border border-outline-variant/20 bg-primary text-on-primary shadow-[0_20px_42px_-30px_rgb(0_38_27_/_0.5)]">
              <div class="h-40 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(121,168,148,0.06))] p-5">
                <p class="font-label text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-fixed">Cultural Books</p>
                <p class="mt-4 max-w-[12rem] font-headline text-2xl font-semibold leading-tight">Materials that carry language and memory forward</p>
              </div>
            </article>
            <article class="overflow-hidden rounded-[1.75rem] border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
              <img
                alt="Handmade clay vessel"
                class="h-44 w-full object-cover"
                loading="lazy"
                src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80"
              />
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
