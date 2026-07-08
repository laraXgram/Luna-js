<script lang="ts">
  import { luna } from '@laraxgram/svelte'
</script>

<div>
  <a href="/infinite-scroll-with-link" use:luna>Go to InfiniteScrollWithLink</a>
  <a href="/infinite-scroll-with-link" use:luna={{ prefetch: true }}>Go to InfiniteScrollWithLink (Prefetch)</a>
</div>
