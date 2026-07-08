<script lang="ts">
  import { luna } from '@lunajs/svelte'
</script>

<div>
  <span id="text">DefaultLayout/Index</span>
  <a href="/default-layout/with-own-layout" use:luna>With Own Layout</a>
  <a href="/default-layout/callback-excluded" use:luna>Callback Excluded</a>
</div>
