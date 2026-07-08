// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import type { FormDataConvertible } from '@lunajs/core'
import type { LunaFormProps } from '@lunajs/react'

const validation = <T extends Record<string, FormDataConvertible>>(errors: () => LunaFormProps<T>['errors']) => {
  type Key = keyof ReturnType<typeof errors>

  const filterAndMap = (key: Key) => {
    const err = errors()

    return (
      Object.keys(err).filter((k) => typeof key === 'string' && k.startsWith(key)) as [keyof ReturnType<typeof errors>]
    ).map((k) => err[k])
  }

  const unique = (key: Key) => {
    return filterAndMap(key).filter((error, index, self) => self.indexOf(error) === index)
  }

  return { filterAndMap, unique }
}

export default function ValidationKey() {
  validation(() => ({ name: 'Validation error' }))

  return <div>{/* ValidationKey component */}</div>
}
