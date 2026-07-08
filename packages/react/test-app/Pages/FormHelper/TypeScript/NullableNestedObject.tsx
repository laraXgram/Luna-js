// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@laraxgram/react'

interface FormData {
  foo: null | {
    bar: string
  }
}

export default function NullableNestedObject() {
  const form = useForm<FormData>({
    foo: null,
  })

  console.log(form.errors['foo.bar'])

  return <div></div>
}
