<script setup lang="ts">
import { usePage } from '@lunajs/vue3'
import { getCurrentInstance, onMounted, ref } from 'vue'

const createdAt = ref<number | null>(null)

onMounted(() => {
  window._luna_nested_layout_id = getCurrentInstance()?.uid
  window._luna_nested_layout_props = usePage().props
  createdAt.value = Date.now()
})
</script>

<template>
  <div>
    <span>Nested Layout</span>
    <span>{{ createdAt }}</span>
    <div>
      <slot />
    </div>
  </div>
</template>
