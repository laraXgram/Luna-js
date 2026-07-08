<script setup lang="ts">
function navigate() {
  window.history.replaceState({ foo: {} }, '')
  window.location.href = '/non-luna'
}
</script>

<template>
  <div>
    <h1>Navigate Non-Luna</h1>
    <p>
      <a href="/non-luna" @click.prevent="navigate">Go to non-Luna page</a>
    </p>
  </div>
</template>
