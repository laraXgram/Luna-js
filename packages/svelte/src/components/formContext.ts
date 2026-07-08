import type { FormComponentRef } from '@laraxgram/luna'
import { createContext } from 'svelte'

const [getFormContext, setFormContext] = createContext<FormComponentRef>()

export function useFormContext<TForm extends object = Record<string, any>>(): FormComponentRef<TForm> | undefined {
  try {
    return getFormContext() as unknown as FormComponentRef<TForm>
  } catch {
    return undefined
  }
}

export { setFormContext }
