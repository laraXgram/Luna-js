<script lang="ts">
  import { Deferred, luna } from '@lunajs/svelte'

  interface Props {
    foo: { text: string } | undefined
    bar: { text: string } | undefined
  }

  let { foo, bar }: Props = $props()
</script>

<Deferred data="foo">
  {#snippet fallback()}
    <div>Loading foo...</div>
  {/snippet}
  {foo?.text}
</Deferred>

<Deferred data="bar">
  {#snippet fallback()}
    <div>Loading bar...</div>
  {/snippet}
  {bar?.text}
</Deferred>

<a href="/deferred-props/page-1" use:luna>Page 1</a>
<a href="/deferred-props/page-2" use:luna>Page 2</a>
<a href="/deferred-props/page-3" use:luna={{ prefetch: true }}>Page 3</a>
