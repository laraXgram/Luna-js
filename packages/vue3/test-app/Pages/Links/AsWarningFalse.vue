<script setup lang="ts">
import type { Method } from '@laraxgram/luna'
import { Link } from '@laraxgram/vue3'

defineProps<{
  method: Method
}>()
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates luna-links without the 'as' warning</span>

    <Link :method="method" href="/example" class="get" as="button">{{ method }} button Link</Link>
  </div>
</template>
