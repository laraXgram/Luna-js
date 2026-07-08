<script lang="ts">
  import { luna } from '@lunajs/svelte'

  let { method } = $props()
</script>

<div>
  <span class="text">This is the links page that demonstrates luna-links without the 'as' warning</span>

  <button use:luna={{ method, href: '/example' }} class="get">{method} button Link</button>
</div>
