<script lang="ts">
  import { Link } from '@laraxgram/svelte'

  let { method } = $props()
</script>

<div>
  <span class="text">This is the links page that demonstrates luna-links with an 'as' warning</span>

  <Link href="/example" {method} class="get">{method} Link</Link>
</div>
