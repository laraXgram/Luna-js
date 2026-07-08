<script module lang="ts">
  import NestedLayout from '@/Layouts/NestedLayout.svelte'
  import SiteLayout from '@/Layouts/SiteLayout.svelte'

  export const layout = [SiteLayout, NestedLayout]
</script>

<script lang="ts">
  import { luna, page } from '@lunajs/svelte'

  window._luna_page_props = page.props
</script>

<div>
  <span class="text">Nested Persistent Layout - Page B</span>
  <a href="/persistent-layouts/shorthand/nested/page-a" use:luna>Page A</a>
</div>
