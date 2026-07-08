<script lang="ts">
  import { Link } from '@laraxgram/svelte'

  let href = $state('/sleep')

  const changeUrl = () => {
    href = '/something-else'
  }
</script>

<div>
  <button onclick={changeUrl}>Change URL</button>
  <Link {href} class="get">The Link</Link>
</div>
