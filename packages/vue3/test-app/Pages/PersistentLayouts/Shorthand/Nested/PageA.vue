<script setup lang="ts">
import { Link, usePage } from '@laraxgram/vue3'
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'

defineOptions({
  layout: [SiteLayout, NestedLayout],
})

window._luna_page_props = usePage().props
</script>

<template>
  <div>
    <span class="text">Nested Persistent Layout - Page A</span>
    <Link href="/persistent-layouts/shorthand/nested/page-b">Page B</Link>
  </div>
</template>
