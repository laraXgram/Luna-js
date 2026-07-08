<script lang="ts">
  import { luna } from '@laraxgram/svelte'
</script>

<div>
  <span class="text">This is the links page that demonstrates passing custom headers</span>
  <a href="/dump/get" use:luna class="default">Standard visit Link</a>

  <a href="/dump/get" use:luna={{ method: 'get', headers: { foo: 'bar' } }} class="custom">GET Link</a>
  <button
    use:luna={{ method: 'post', href: '/dump/post', headers: { bar: 'baz', 'X-Requested-With': 'custom' } }}
    class="overridden">POST Link</button
  >
</div>
