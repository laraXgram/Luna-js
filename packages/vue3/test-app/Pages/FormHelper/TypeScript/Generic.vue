<script setup lang="ts" generic="TFormData extends Record<string, FormDataConvertible>">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import type { FormDataConvertible } from '@laraxgram/luna'
import type { LunaForm } from '@laraxgram/vue3'

defineProps<{
  form: LunaForm<TFormData>
}>()
</script>
