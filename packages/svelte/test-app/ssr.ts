import { createLunaApp, type ResolvedComponent } from '@laraxgram/svelte'
import createServer from '@laraxgram/svelte/server'
import { render } from 'svelte/server'

createServer((page) =>
  createLunaApp({
    page,
    serverHead: (page) => page.props.head as string[],
    resolve: (name) => {
      const pages = import.meta.glob<ResolvedComponent>('./Pages/SSR/**/*.svelte', { eager: true })
      return pages[`./Pages/${name}.svelte`]
    },
    setup({ App, props }) {
      return render(App, { props })
    },
  }),
)
