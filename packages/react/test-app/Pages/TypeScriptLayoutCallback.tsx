// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import type { LayoutCallback } from '@lunajs/react'
import AppLayout from '../Layouts/AppLayout'

declare module '@lunajs/core' {
  export interface LunaConfig {
    sharedPageProps: {
      auth: { user: { name: string } | null }
    }
  }
}

const callback: LayoutCallback = (props) => {
  const name: string | undefined = props.auth.user?.name

  // @ts-expect-error - 'nonExistent' does not exist on shared page props
  console.log(props.nonExistent)

  return [AppLayout, { title: name }]
}

const TypeScriptLayoutCallback = () => null
TypeScriptLayoutCallback.layout = callback

export default TypeScriptLayoutCallback
