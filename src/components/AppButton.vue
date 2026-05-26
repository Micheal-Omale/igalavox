<script setup>
defineProps({
  as: {
    type: String,
    default: 'button',
  },
  href: {
    type: String,
    default: undefined,
  },
  to: {
    type: [String, Object],
    default: undefined,
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost'].includes(value),
  },
  type: {
    type: String,
    default: 'button',
  },
})

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded px-6 py-3 font-label text-sm font-semibold tracking-[0.05em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary'

const variantClasses = {
  primary: 'bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:shadow-[0_8px_22px_rgb(92_58_33_/_0.12)]',
  secondary: 'border border-secondary text-secondary hover:bg-surface-container hover:shadow-[0_8px_22px_rgb(92_58_33_/_0.08)]',
  ghost: 'text-secondary hover:bg-surface-container',
}
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="[baseClasses, variantClasses[variant]]">
    <slot />
  </RouterLink>
  <a v-else-if="href" :href="href" :class="[baseClasses, variantClasses[variant]]">
    <slot />
  </a>
  <component :is="as" v-else :type="as === 'button' ? type : undefined" :class="[baseClasses, variantClasses[variant]]">
    <slot />
  </component>
</template>
