<script module lang="ts">
  import type { Component } from 'svelte'
  import NestedLayout from '@/Layouts/NestedLayout.svelte'
  import SiteLayout from '@/Layouts/SiteLayout.svelte'

  export const layout = (h: (component: Component, children: Component[]) => Component, page: Component) => {
    return h(SiteLayout, [h(NestedLayout, [page])])
  }
</script>

<script lang="ts">
  import { luna } from '@laraxgram/svelte'
</script>

<div>
  <span class="text">Nested Persistent Layout - Page B</span>
  <a href="/persistent-layouts/render-function/nested/page-a" use:luna>Page A</a>
</div>
