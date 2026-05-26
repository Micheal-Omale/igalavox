<script setup>
import { ref } from 'vue'
import AppButton from './AppButton.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const onInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const onSubmit = () => {
  emit('search', props.modelValue)
}
</script>

<template>
  <form 
    class="group relative mx-auto mt-8 w-full max-w-2xl sm:mt-10" 
    role="search"
    @submit.prevent="onSubmit"
  >
    <div class="absolute -inset-1 rounded-full bg-gradient-to-r from-tertiary to-primary opacity-25 blur"></div>
    <div class="ambient-shadow relative flex items-stretch gap-2 rounded-full border-2 border-surface-variant bg-surface-container-lowest p-2 focus-within:border-tertiary">
      <div class="flex min-w-0 flex-1 items-center">
        <span class="material-symbols-outlined ml-2 text-outline sm:ml-4">search</span>
        <input
          :value="modelValue"
          class="min-w-0 flex-1 border-none bg-transparent px-2 py-2 font-body text-base text-on-surface outline-none focus:ring-0 sm:px-4 sm:py-3 sm:text-lg"
          placeholder="Search for a name (e.g., Idoko)"
          type="search"
          @input="onInput"
        />
      </div>
      <AppButton type="submit" class="shrink-0 justify-center self-stretch rounded-full px-4 sm:h-auto sm:px-6">Search</AppButton>
    </div>
  </form>
</template>
