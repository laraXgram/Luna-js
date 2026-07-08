import { createLunaApp, type ResolvedComponent } from '@lunajs/react'
import createServer from '@lunajs/react/server'
import ReactDOMServer from 'react-dom/server'

createServer((page) =>
  createLunaApp({
    page,
    render: ReactDOMServer.renderToString,
    serverHead: (page) => page.props.head as string[],
    resolve: (name) => {
      const pages = import.meta.glob<ResolvedComponent>('./Pages/SSR/**/*.tsx', { eager: true })
      return pages[`./Pages/${name}.tsx`]
    },
    setup: ({ App, props }) => <App {...props} />,
    ...(page.url.includes('withTitleCallback') && {
      title: (title, page) => [title, page.props.titleSuffix].filter(Boolean).join(' | '),
    }),
  }),
)
