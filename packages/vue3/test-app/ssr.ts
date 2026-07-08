import { createLunaApp } from '@laraxgram/vue3'
import createServer from '@laraxgram/vue3/server'
import { createSSRApp, h, type DefineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'

createServer((page) =>
  createLunaApp({
    page,
    render: renderToString,
    serverHead: (page) => page.props.head as string[],
    resolve: (name) => {
      const pages = import.meta.glob<DefineComponent>('./Pages/SSR/**/*.vue', { eager: true })
      return pages[`./Pages/${name}.vue`]
    },
    setup({ App, props, plugin }) {
      return createSSRApp({
        render: () => h(App, props),
      }).use(plugin)
    },
    ...(page.url.includes('withTitleCallback') && {
      title: (title, page) => [title, page.props.titleSuffix].filter(Boolean).join(' | '),
    }),
  }),
)
