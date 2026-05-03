<script setup>
defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['update:modelValue'])

const inputClasses = 'w-full rounded-lg border border-outline-variant bg-surface-container-low py-3 pl-10 pr-4 font-body text-base text-on-surface shadow-sm outline-none transition-colors placeholder:text-outline-variant focus:border-tertiary focus:ring-1 focus:ring-tertiary'
</script>

<template>
  <div class="space-y-2">
    <label class="block font-label text-sm font-semibold tracking-[0.05em] text-on-surface" :for="id">
      {{ label }}
    </label>
    <div class="relative">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">{{ icon }}</span>

      <select
        v-if="options.length"
        :id="id"
        :name="id"
        :value="modelValue"
        :class="[inputClasses, 'appearance-none pr-10']"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option disabled value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <input
        v-else
        :id="id"
        :name="id"
        :placeholder="placeholder"
        :type="type"
        :value="modelValue"
        :class="inputClasses"
        @input="$emit('update:modelValue', $event.target.value)"
      />

      <span
        v-if="options.length"
        class="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline"
      >
        expand_more
      </span>
    </div>
  </div>
</template>
