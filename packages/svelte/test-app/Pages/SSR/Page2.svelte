<script lang="ts">
  import { luna } from '@lunajs/svelte'

  interface Props {
    navigatedTo: boolean
  }

  let { navigatedTo }: Props = $props()
</script>

<div>
  <h1 data-testid="ssr-title">SSR Page 2</h1>
  <p data-testid="navigated-status">Navigated: {navigatedTo}</p>

  <a href="/ssr/page1" use:luna data-testid="back-link">Go back</a>
</div>
