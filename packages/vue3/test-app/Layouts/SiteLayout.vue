<script setup lang="ts">
import { usePage } from '@laraxgram/vue3'
import { getCurrentInstance, onMounted, ref } from 'vue'

const createdAt = ref<number | null>(null)

onMounted(() => {
  window._luna_layout_id = getCurrentInstance()?.uid
  window._luna_site_layout_props = usePage().props
  createdAt.value = Date.now()
})
</script>

<template>
  <div>
    <span>Site Layout</span>
    <span>{{ createdAt }}</span>
    <div>
      <slot />
    </div>
  </div>
</template>
