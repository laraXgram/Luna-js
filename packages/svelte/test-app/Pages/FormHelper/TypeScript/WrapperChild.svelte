<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" generics="T extends Record<string, any>">
  import { useForm, type LunaForm } from '@laraxgram/svelte'
  import type { Snippet } from 'svelte'

  let { data, children }: { data: T; children: Snippet<[LunaForm<T>]> } = $props()

  // svelte-ignore state_referenced_locally
  const form = useForm(data)
</script>

<form>
  {@render children(form)}
</form>
