// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import type { FormDataConvertible } from '@laraxgram/luna'
import type { LunaFormProps } from '@laraxgram/react'

interface GenericProps<TFormData extends Record<string, FormDataConvertible>> {
  form: LunaFormProps<TFormData>
}

export default function Generic<TFormData extends Record<string, FormDataConvertible>>({
  form,
}: GenericProps<TFormData>) {
  console.log(form)
  return <div>{/* Generic form component */}</div>
}
