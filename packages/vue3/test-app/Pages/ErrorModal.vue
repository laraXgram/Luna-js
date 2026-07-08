<script setup lang="ts">
import { router } from '@lunajs/vue3'

const invalidVisit = () => {
  router.post('/non-luna')
}

const invalidVisitJson = () => {
  router.post('/json')
}

const invalidVisitXss = () => {
  router.post('/non-luna/xss')
}
</script>

<template>
  <div>
    <span @click="invalidVisit" class="invalid-visit">Invalid Visit</span>
    <span @click="invalidVisitJson" class="invalid-visit-json">Invalid Visit (JSON response)</span>
    <span @click="invalidVisitXss" class="invalid-visit-xss">Invalid Visit (XSS)</span>
  </div>
</template>
