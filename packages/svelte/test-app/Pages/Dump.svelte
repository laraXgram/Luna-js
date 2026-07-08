<script lang="ts">
  import type { Method } from '@lunajs/core'
  import { page } from '@lunajs/svelte'
  import type { MulterFile } from '../types'

  interface Props {
    headers: Record<string, string>
    method: Method
    form: Record<string, unknown>
    files: MulterFile[] | object
    url: string
    query: Record<string, unknown>
  }

  let { headers, method, form, files = {}, url, query }: Props = $props()

  // svelte-ignore state_referenced_locally
  const dump = {
    headers,
    method,
    form,
    files,
    query,
    url,
    page: page,
  }

  $effect(() => {
    window._luna_request_dump = dump
  })
</script>

<div>
  <div class="text">This is Luna page component containing a data dump of the request</div>
  <hr />
  <pre class="dump" style="white-space: pre-wrap; word-break: keep-all;">{JSON.stringify(dump)}</pre>
</div>
