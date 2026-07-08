<script setup lang="ts">
import { Link, usePoll } from '@laraxgram/vue3'

usePoll(500, {
  only: ['custom_prop'],
  onFinish() {
    console.log('hook poll finished')
  },
})
</script>

<template>
  <Link href="/">Home</Link>
</template>
