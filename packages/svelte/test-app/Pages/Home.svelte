<script lang="ts">
  import { luna, page, router } from '@lunajs/svelte'
  import { onMount } from 'svelte'

  const visitsMethod = () => {
    router.visit('/visits/method')
  }

  const visitsReplace = () => {
    router.get('/visits/replace')
  }

  const redirect = () => {
    router.post('/redirect')
  }

  const redirectExternal = () => {
    router.post('/redirect-external')
  }

  const redirectHash = () => {
    router.get('/redirect-hash')
  }

  const redirectHashPost = () => {
    router.post('/redirect-hash')
  }

  onMount(() => {
    window._luna_page_key = crypto.randomUUID()
    window._luna_props = page.props
    window._plugin_global_props = {}
  })
</script>

<div>
  <span class="text">This is the Test App Entrypoint page</span>

  <a href="/links/method" use:luna class="links-method">Basic Links</a>
  <a href="/links/replace" use:luna class="links-replace">'Replace' Links</a>

  <a href={'#'} onclick={visitsMethod} class="visits-method">Manual basic visits</a>
  <a href={'#'} onclick={visitsReplace} class="visits-replace">Manual 'Replace' visits</a>

  <button use:luna={{ href: '/redirect', method: 'post' }} class="links-redirect">Internal Redirect Link</button>
  <a href={'#'} onclick={redirect} class="visits-redirect">Manual Redirect visit</a>

  <button use:luna={{ href: '/redirect-external', method: 'post' }} class="links-redirect-external"
    >External Redirect Link</button
  >
  <a href={'#'} onclick={redirectExternal} class="visits-redirect-external">Manual External Redirect visit</a>

  <a href={'#'} onclick={redirectHash} class="visits-redirect-hash">Manual Hash Redirect visit</a>
  <a href={'#'} onclick={redirectHashPost} class="visits-redirect-hash-post">Manual Hash Redirect POST visit</a>

  <a href="/links/as-element" use:luna class="link-targets-self" target="_self">Target _self</a>
  <a href="/links/as-element" use:luna class="link-targets-blank" target="_blank">Target _blank</a>
</div>
