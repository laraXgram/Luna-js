<script lang="ts">
  import { luna, router } from '@laraxgram/svelte'
  import { onMount } from 'svelte'

  onMount(() => {
    router.on('navigate', (event) => {
      console.log(String(event.detail.cached))
    })
  })
</script>

<a href="/prefetch/navigate-event/cached" use:luna={{ prefetch: 'mount' }}>Prefetched Link</a>
<a href="/prefetch/navigate-event/fresh" use:luna>Regular Link</a>
