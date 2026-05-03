<script setup>
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'
import SiteFooter from './components/SiteFooter.vue'
import SiteNavbar from './components/SiteNavbar.vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-background text-on-background texture-bg">
    <SiteNavbar v-if="!route.meta.hideShell" />
    <RouterView />
    <SiteFooter v-if="!route.meta.hideShell" />
  </div>
</template>
