<script setup lang="ts">
import { Link } from '@lunajs/vue3'
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates replace on Links</span>

    <Link href="/dump/get" replace class="replace">[State] Replace: true</Link>
    <Link href="/dump/get" :replace="false" class="replace-false">[State] Replace: false</Link>
  </div>
</template>
