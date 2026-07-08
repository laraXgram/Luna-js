<script module lang="ts">
  import PageLayout from '@/Layouts/PageLayout.svelte'

  export const layout = PageLayout
</script>

<script lang="ts">
  import { luna } from '@lunajs/svelte'
</script>

<div>
  <span id="text">DefaultLayout/WithOwnLayout</span>
  <a href="/default-layout" use:luna>Back to Index</a>
</div>
