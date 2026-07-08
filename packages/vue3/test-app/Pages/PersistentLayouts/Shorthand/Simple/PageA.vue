<script setup lang="ts">
import { Link, usePage } from '@laraxgram/vue3'
import Layout from '@/Layouts/SiteLayout.vue'

defineOptions({
  layout: Layout,
})

window._luna_page_props = usePage().props
</script>

<template>
  <div>
    <span class="text">Simple Persistent Layout - Page A</span>
    <Link href="/persistent-layouts/shorthand/simple/page-b">Page B</Link>
  </div>
</template>
