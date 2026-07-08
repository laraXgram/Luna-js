<script lang="ts">
  import { luna } from '@laraxgram/svelte'
  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
</script>

<div>
  <a href="/prefetch/1" use:luna={{ prefetch: true }}>On Hover (Default)</a>
  <a href="/prefetch/2" use:luna={{ prefetch: 'mount' }}>On Mount</a>
  <a href="/prefetch/3" use:luna={{ prefetch: 'click' }}>On Click</a>
  <a href="/prefetch/4" use:luna={{ prefetch: ['hover', 'mount'], cacheFor: '1s' }}>On Hover + Mount</a>
  <a href="/prefetch/5" use:luna={{ prefetch: 'mount', cacheFor: '0' }}>On Mount (Once)</a>
  <a href="/prefetch/6" use:luna={{ prefetch: 'click' }}>On Enter</a>
  <button use:luna={{ href: '/prefetch/7', prefetch: 'click' }}>On Spacebar</button>
  <div>
    {@render children?.()}
  </div>
</div>
