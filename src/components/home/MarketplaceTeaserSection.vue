<template>
  <section class="bg-surface-container-low px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
    <div class="mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-secondary/10 bg-gradient-to-br from-primary-container via-primary to-secondary p-6 text-on-primary shadow-[0_20px_40px_-24px_rgb(11_61_46_/_0.45)] sm:p-8 lg:p-10">
      <div class="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div class="max-w-2xl">
          <p class="font-label text-xs font-semibold uppercase tracking-[0.2em] text-primary-fixed">Marketplace</p>
          <h2 class="mt-5 font-headline text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Explore books, fabrics, crafts, and cultural products with story at the center
          </h2>
          <p class="mt-4 font-body text-base leading-8 text-primary-fixed">
            The marketplace supports artisans, educators, and cultural producers with a carefully curated storefront rooted in heritage, quality, and community pride.
          </p>
          <RouterLink
            class="mt-6 inline-flex items-center gap-2 rounded border border-white/20 bg-white/10 px-6 py-3 font-label text-sm font-semibold tracking-[0.05em] text-white transition-colors hover:bg-white/15"
            to="/marketplace"
          >
            Visit Marketplace
            <span class="material-symbols-outlined text-base">arrow_forward</span>
          </RouterLink>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <article class="rounded-[1.25rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <div class="h-32 rounded-xl bg-[linear-gradient(135deg,rgba(252,249,244,0.24),rgba(254,202,168,0.18))]"></div>
            <p class="mt-4 font-label text-xs font-semibold uppercase tracking-[0.12em] text-primary-fixed">Books</p>
          </article>
          <article class="rounded-[1.25rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm sm:translate-y-8">
            <div class="h-32 rounded-xl bg-[linear-gradient(135deg,rgba(252,249,244,0.22),rgba(188,237,215,0.18))]"></div>
            <p class="mt-4 font-label text-xs font-semibold uppercase tracking-[0.12em] text-primary-fixed">Crafts</p>
          </article>
          <article class="rounded-[1.25rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <div class="h-32 rounded-xl bg-[linear-gradient(135deg,rgba(252,249,244,0.2),rgba(203,167,47,0.18))]"></div>
            <p class="mt-4 font-label text-xs font-semibold uppercase tracking-[0.12em] text-primary-fixed">Textiles</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
