<script setup lang="ts">
import type { Method } from '@laraxgram/luna'
import { Link } from '@laraxgram/vue3'

defineProps<{
  method: Method
}>()
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates luna-links with an 'as' warning</span>

    <Link :method="method" href="/example" class="get">{{ method }} Link</Link>
  </div>
</template>
