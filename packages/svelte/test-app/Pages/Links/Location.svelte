<script lang="ts">
  import { luna } from '@laraxgram/svelte'
</script>

<div>
  <span class="text">This is the links page that demonstrates location visits luna-links</span>

  <a href="/location" use:luna={{ replace: true }} class="example">Location visit</a>
</div>
