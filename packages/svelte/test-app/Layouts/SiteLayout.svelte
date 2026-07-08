<script lang="ts">
  import { page } from '@lunajs/svelte'
  import { onMount } from 'svelte'
  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()

  let createdAt: number | null = $state(null)

  onMount(() => {
    window._luna_layout_id = crypto.randomUUID()
    window._luna_site_layout_props = page.props
    createdAt = Date.now()
  })
</script>

<div>
  <span>Site Layout</span>
  <span>{createdAt}</span>
  <div>
    {@render children?.()}
  </div>
</div>
