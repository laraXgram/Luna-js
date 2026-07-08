<script setup lang="ts">
import { Link, usePoll } from '@lunajs/vue3'

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
