<script lang="ts">
  import { luna, usePage } from '@lunajs/svelte'
  import { router } from '@lunajs/svelte'

  const page = usePage()

  const visitWithFragment = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/preserve-fragment/redirect#my-fragment')
  }
</script>

<div>
  <span id="current-url">{page.url}</span>

  <a href="/preserve-fragment/redirect#my-fragment" use:luna id="link-with-fragment">Link with fragment</a>

  <a href={'#'} onclick={visitWithFragment} id="manual-visit-with-fragment">Manual visit with fragment</a>
</div>
