// This file is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { createLunaApp } from '@lunajs/vue3'
import type { DefineComponent } from 'vue'
import { createApp, h } from 'vue'

declare module '@lunajs/core' {
  export interface LunaConfig {
    sharedPageProps: {
      auth: { user: { name: string } | null }
    }
  }
}

// createLunaApp setup should include shared props without explicit generic
createLunaApp({
  resolve: (name, page) => {
    console.log(page?.props.auth.user?.name)
    // @ts-expect-error - 'email' does not exist on user
    console.log(page?.props.auth.user?.email)

    const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue', { eager: true })
    return pages[`./Pages/${name}.vue`]
  },
  setup({ el, App, props, plugin }) {
    console.log(props.initialPage.props.auth.user?.name)
    // @ts-expect-error - 'email' does not exist on user
    console.log(props.initialPage.props.auth.user?.email)

    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
})
