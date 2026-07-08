<script lang="ts" generics="TFormData extends Record<string, FormDataConvertible>">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import type { FormDataConvertible } from '@lunajs/core'
  import type { LunaForm } from '@lunajs/svelte'

  interface Props {
    form: LunaForm<TFormData>
  }

  let { form }: Props = $props()
</script>

<div>{form}</div>
