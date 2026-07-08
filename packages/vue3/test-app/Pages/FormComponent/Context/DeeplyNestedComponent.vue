<script setup lang="ts">
import { useFormContext } from '@laraxgram/vue3'

const form = useFormContext()
</script>

<template>
  <div v-if="form">
    <span>Deeply Nested: Form is {{ form.isDirty ? 'dirty' : 'clean' }}</span>
  </div>
  <div v-else>No context</div>
</template>
