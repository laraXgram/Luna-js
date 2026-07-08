<script lang="ts">
  import { luna } from '@lunajs/svelte'
</script>

<div>
  <span class="text">This is the links page that demonstrates passing data through plain objects</span>

  <a href="/dump/get" use:luna={{ method: 'get', data: { foo: 'get' } }} class="get">GET Link</a>
  <button use:luna={{ method: 'post', href: '/dump/post', data: { bar: 'post' } }} class="post">POST Link</button>
  <button use:luna={{ method: 'put', href: '/dump/put', data: { baz: 'put' } }} class="put">PUT Link</button>
  <button use:luna={{ method: 'patch', href: '/dump/patch', data: { foo: 'patch' } }} class="patch"
    >PATCH Link</button
  >
  <button use:luna={{ method: 'delete', href: '/dump/delete', data: { bar: 'delete' } }} class="delete"
    >DELETE Link</button
  >

  <a href="/dump/get" use:luna={{ data: { a: ['b', 'c'] } }} class="qsaf-default">QSAF Defaults</a>
  <a href="/dump/get" use:luna={{ data: { a: ['b', 'c'] }, queryStringArrayFormat: 'indices' }} class="qsaf-indices"
    >QSAF Indices</a
  >
  <a
    href="/dump/get"
    use:luna={{ data: { a: ['b', 'c'] }, queryStringArrayFormat: 'brackets' }}
    class="qsaf-brackets">QSAF Brackets</a
  >
</div>
