<script lang="ts">
  import { luna } from '@lunajs/svelte'
  import { onMount } from 'svelte'

  let linkData = new FormData()

  onMount(() => {
    linkData.append('bar', 'baz')
  })
</script>

<div>
  <span class="text">This is the links page that demonstrates passing data through FormData objects</span>

  <a href="/dump/get" use:luna={{ method: 'get', data: linkData }} class="get">GET Link</a>
  <button use:luna={{ method: 'post', href: '/dump/post', data: linkData }} class="post">POST Link</button>
  <button use:luna={{ method: 'put', href: '/dump/put', data: linkData }} class="put">PUT Link</button>
  <button use:luna={{ method: 'patch', href: '/dump/patch', data: linkData }} class="patch">PATCH Link</button>
  <button use:luna={{ method: 'delete', href: '/dump/delete', data: linkData }} class="delete">DELETE Link</button>
</div>
