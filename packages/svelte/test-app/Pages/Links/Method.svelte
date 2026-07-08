<script lang="ts">
  import { luna } from '@laraxgram/svelte'
</script>

<div>
  <span class="text">This is the links page that demonstrates luna-link methods</span>

  <a href="/dump/get" use:luna={{ method: 'get' }} class="get">GET Link</a>
  <button use:luna={{ method: 'post', href: '/dump/post' }} class="post">POST Link</button>
  <button use:luna={{ method: 'put', href: '/dump/put' }} class="put">PUT Link</button>
  <button use:luna={{ method: 'patch', href: '/dump/patch' }} class="patch">PATCH Link</button>
  <button use:luna={{ method: 'delete', href: '/dump/delete' }} class="delete">DELETE Link</button>
  <button use:luna={{ href: { url: '/dump/post', method: 'post' } }}>OBJECT Link</button>
  <button use:luna={{ href: { url: '/dump/post', method: 'post' }, method: 'put' }}
    >OBJECT METHOD OVERRIDE Link</button
  >
</div>
