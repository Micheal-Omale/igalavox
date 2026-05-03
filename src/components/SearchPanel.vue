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
    <div class="absolute -inset-1 rounded-full bg-gradient-to-r from-tertiary to-primary opacity-25 blur transition duration-700 group-hover:opacity-40"></div>
    <div class="ambient-shadow relative flex flex-col gap-3 rounded-[1.5rem] border-2 border-surface-variant bg-surface-container-lowest p-3 transition focus-within:border-tertiary sm:flex-row sm:items-stretch sm:gap-2 sm:rounded-full sm:p-2">
      <div class="flex min-w-0 flex-1 items-center">
        <span class="material-symbols-outlined ml-2 text-outline sm:ml-4">search</span>
        <input
          :value="modelValue"
          class="min-w-0 flex-1 border-none bg-transparent px-3 py-2 font-body text-base text-on-surface outline-none focus:ring-0 sm:px-4 sm:py-3 sm:text-lg"
          placeholder="Search for a name (e.g., Idoko)"
          type="search"
          @input="onInput"
        />
      </div>
      <AppButton type="submit" class="w-full justify-center sm:h-auto sm:w-auto sm:shrink-0 sm:self-stretch sm:rounded-full">Search</AppButton>
    </div>
  </form>
</template>
