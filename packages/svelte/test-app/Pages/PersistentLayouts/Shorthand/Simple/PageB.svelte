<script module lang="ts">
  import SiteLayout from '@/Layouts/SiteLayout.svelte'

  export const layout = SiteLayout
</script>

<script lang="ts">
  import { luna, page } from '@laraxgram/svelte'

  window._luna_page_props = page.props
</script>

<div>
  <span class="text">Simple Persistent Layout - Page B</span>
  <a href="/persistent-layouts/shorthand/simple/page-a" use:luna>Page A</a>
</div>
