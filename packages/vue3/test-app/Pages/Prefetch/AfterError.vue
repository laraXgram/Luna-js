<script setup lang="ts">
import { router } from '@lunajs/vue3'

const prefetchPage = () => {
  router.prefetch('/prefetch/swr/1', { method: 'get' }, { cacheFor: 5000 })
}

const visitPage = () => {
  router.visit('/prefetch/swr/1')
}

const prefetchNonLuna = () => {
  router.prefetch('/non-luna', { method: 'get' }, { cacheFor: 5000 })
}

const visitNonLuna = () => {
  router.visit('/non-luna')
}
</script>

<template>
  <div>
    <button @click="prefetchPage">Prefetch Page</button>
    <button @click="visitPage">Visit Page</button>
    <button @click="prefetchNonLuna">Prefetch Non-Luna</button>
    <button @click="visitNonLuna">Visit Non-Luna</button>
  </div>
</template>
