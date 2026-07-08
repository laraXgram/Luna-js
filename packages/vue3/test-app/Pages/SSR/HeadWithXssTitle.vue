<script setup lang="ts">
import { Head } from '@lunajs/vue3'

defineProps<{
  title: string
}>()
</script>

<template>
  <Head :title="title" />
  <div>
    <p>Head title escaping test</p>
  </div>
</template>
