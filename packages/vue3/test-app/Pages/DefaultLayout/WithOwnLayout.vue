<script setup lang="ts">
import { Link } from '@laraxgram/vue3'
import PageLayout from '@/Layouts/PageLayout.vue'

defineOptions({
  layout: PageLayout,
})
</script>

<template>
  <div>
    <span id="text">DefaultLayout/WithOwnLayout</span>
    <Link href="/default-layout">Back to Index</Link>
  </div>
</template>
