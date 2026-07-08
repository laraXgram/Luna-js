<script module lang="ts">
  import type { Component } from 'svelte'
  import SiteLayout from '@/Layouts/SiteLayout.svelte'

  export const layout = (h: (component: Component, children: Component[]) => Component, page: Component) =>
    h(SiteLayout, [page])
</script>

<script lang="ts">
  import { luna } from '@laraxgram/svelte'
</script>

<div>
  <span class="text">Simple Persistent Layout - Page B</span>
  <a href="/persistent-layouts/render-function/simple/page-a" use:luna>Page A</a>
</div>
