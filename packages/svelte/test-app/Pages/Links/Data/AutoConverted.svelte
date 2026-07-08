<script lang="ts">
  import { luna } from '@laraxgram/svelte'

  const linkData = {
    file: new File([], 'example.jpg'),
    foo: 'bar',
  }
</script>

<div>
  <span class="text"
    >This is the links page that demonstrates the automatic conversion of plain objects to form-data</span
  >

  <a href="/dump/get" use:luna={{ method: 'get', data: linkData }} class="get">GET Link</a>
  <button use:luna={{ method: 'post', href: '/dump/post', data: linkData }} class="post">POST Link</button>
  <button use:luna={{ method: 'put', href: '/dump/put', data: linkData }} class="put">PUT Link</button>
  <button use:luna={{ method: 'patch', href: '/dump/patch', data: linkData }} class="patch">PATCH Link</button>
  <button use:luna={{ method: 'delete', href: '/dump/delete', data: linkData }} class="delete">DELETE Link</button>
</div>
