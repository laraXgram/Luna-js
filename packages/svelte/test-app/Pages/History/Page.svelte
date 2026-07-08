<script lang="ts">
  import { luna, router } from '@laraxgram/svelte'

  let { pageNumber, multiByte } = $props()
</script>

<a href="/history/1" use:luna>Page 1</a>
<a href="/history/2" use:luna>Page 2</a>
<a href="/history/3" use:luna>Page 3</a>
<a href="/history/4" use:luna>Page 4</a>
<a href="/history/5" use:luna>Page 5</a>

<button onclick={() => router.clearHistory()}>Clear History</button>

<div>This is page {pageNumber}.</div>
<div>Multi byte character: {multiByte}</div>

<div style="height: 5000px"></div>
