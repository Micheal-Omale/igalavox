<script setup>
import { computed } from 'vue'
import { getEmbedConfig } from '../../utils/socialVideo'

const props = defineProps({
  story: {
    type: Object,
    required: true,
  },
  evidence: {
    type: Object,
    default: null,
  },
})

const storyRoute = computed(() => `/impact/stories/${props.story.id}`)
const embedConfig = computed(() => (
  props.evidence?.media_url ? getEmbedConfig(props.evidence.media_url) : null
))
const isFacebookPreview = computed(() => (
  props.evidence?.media_type === 'facebook' && Boolean(embedConfig.value?.embedUrl)
))

const platformLabel = computed(() => {
  switch (props.evidence?.media_type) {
    case 'youtube': return 'YouTube'
    case 'tiktok': return 'TikTok'
    case 'facebook': return 'Facebook'
    default: return 'Community Story'
  }
})
</script>

<template>
  <RouterLink :to="storyRoute" class="group block h-48 bg-surface-container">
    <div
      v-if="evidence"
      class="relative h-full overflow-hidden bg-[linear-gradient(145deg,_rgba(0,38,27,0.96),_rgba(11,61,46,0.82)_52%,_rgba(124,86,59,0.62))]"
    >
      <iframe
        v-if="isFacebookPreview"
        :src="embedConfig.embedUrl"
        title="Facebook video preview"
        class="pointer-events-none absolute inset-0 h-full w-full border-0"
        loading="lazy"
        scrolling="no"
        allow="encrypted-media; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>

      <img
        v-else-if="embedConfig?.thumbnailUrl"
        :src="embedConfig.thumbnailUrl"
        :alt="story.community_name || 'Community video story'"
        class="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div
        v-else
        class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(188,237,215,0.16),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(254,202,168,0.2),_transparent_36%)]"
      ></div>

      <div class="absolute inset-0 bg-[linear-gradient(to_top,_rgba(0,0,0,0.52),_rgba(0,0,0,0.12)_45%,_rgba(0,0,0,0.18))]"></div>

      <div class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 backdrop-blur-md">
        <span class="material-symbols-outlined text-[16px] text-white/85">play_circle</span>
        <span class="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-white">{{ platformLabel }}</span>
      </div>

      <div class="absolute inset-0 flex items-center justify-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
          <span class="material-symbols-outlined ml-1 text-3xl">play_arrow</span>
        </div>
      </div>

      <div class="absolute bottom-4 left-4 right-4">
        <p class="line-clamp-2 font-body text-sm leading-6 text-white/88">
          {{ evidence.title || story.title || story.community_name }}
        </p>
      </div>
    </div>

    <img
      v-else-if="story.image_urls?.length"
      :src="story.image_urls[0]"
      :alt="story.community_name || 'Community Impact'"
      class="h-full w-full object-cover"
      loading="lazy"
    />

    <img
      v-else-if="story.image_url"
      :src="story.image_url"
      :alt="story.community_name || 'Community Impact'"
      class="h-full w-full object-cover"
      loading="lazy"
    />

    <div v-else class="flex h-full items-center justify-center text-outline">
      <span class="material-symbols-outlined text-5xl">auto_stories</span>
    </div>
  </RouterLink>
</template>
