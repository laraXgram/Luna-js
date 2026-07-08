<script module lang="ts">
  import type { Component } from 'svelte'
  import NestedLayout from '@/Layouts/NestedLayout.svelte'
  import SiteLayout from '@/Layouts/SiteLayout.svelte'

  export const layout = (h: (component: Component, children: Component[]) => Component, page: Component) => {
    return h(SiteLayout, [h(NestedLayout, [page])])
  }
</script>

<script lang="ts">
  import { luna } from '@lunajs/svelte'
</script>

<div>
  <span class="text">Nested Persistent Layout - Page A</span>
  <a href="/persistent-layouts/render-function/nested/page-b" use:luna>Page B</a>
</div>
