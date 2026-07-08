<script lang="ts">
  import { router } from '@laraxgram/svelte'

  const prefetchPage = () => {
    router.prefetch('/prefetch/swr/1', { method: 'get' }, { cacheFor: 5000 })
  }

  const visitPage = () => {
    router.visit('/prefetch/swr/1')
  }

  const prefetchNonLuna = () => {
    router.prefetch('/non-luna', { method: 'get' }, { cacheFor: 5000 })
  }

  const visitNonLuna = () => {
    router.visit('/non-luna')
  }
</script>

<div>
  <button onclick={prefetchPage}>Prefetch Page</button>
  <button onclick={visitPage}>Visit Page</button>
  <button onclick={prefetchNonLuna}>Prefetch Non-Luna</button>
  <button onclick={visitNonLuna}>Visit Non-Luna</button>
</div>
