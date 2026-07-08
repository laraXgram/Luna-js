import { describe, expect, it } from 'vitest'
import { defaultFrameworks } from '../src/frameworks/index'
import { transformPageResolution } from '../src/pagesTransform'
import { findLunaAppExport, wrapWithServerBootstrap } from '../src/ssrTransform'

const wrap = (code: string, options = {}) => wrapWithServerBootstrap(code, options, defaultFrameworks)
const transformPages = (code: string) => transformPageResolution(code, defaultFrameworks)?.code ?? null

describe('SSR Transform', () => {
  describe('findLunaAppExport', () => {
    it('finds createLunaApp call', () => {
      expect(findLunaAppExport(`createLunaApp({ resolve: name => name })`)).toBe(true)
    })

    it('returns false for other function calls', () => {
      expect(findLunaAppExport(`someOtherFunction({})`)).toBe(false)
    })

    it('returns false for invalid code', () => {
      expect(findLunaAppExport(`{{{ invalid syntax`)).toBe(false)
    })

    it('returns false for export default', () => {
      expect(findLunaAppExport(`export default createLunaApp({})`)).toBe(false)
    })

    it('finds createServer call (legacy pattern)', () => {
      expect(findLunaAppExport(`createServer((page) => createLunaApp({ page }))`)).toBe(true)
    })

    it('returns false for export default createServer', () => {
      expect(findLunaAppExport(`export default createServer((page) => createLunaApp({ page }))`)).toBe(false)
    })
  })

  describe('wrapWithServerBootstrap', () => {
    it('wraps with server bootstrap for Svelte', () => {
      const code = `import { createLunaApp } from '@lunajs/svelte'
createLunaApp({ resolve: (name) => name })`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createLunaApp } from '@lunajs/svelte'
        import createServer from '@lunajs/svelte/server'
        import { render } from 'svelte/server'

        const ssr = await createLunaApp({ resolve: (name) => name })

        const renderPage = (page) => ssr(page, render)

        if (import.meta.env.PROD) {
          createServer(renderPage)
        }

        export default renderPage"
      `)
    })

    it('wraps with server bootstrap for Vue', () => {
      const code = `import { createLunaApp } from '@lunajs/vue3'
createLunaApp({})`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createLunaApp } from '@lunajs/vue3'
        import createServer from '@lunajs/vue3/server'
        import { renderToString } from 'vue/server-renderer'

        const render = await createLunaApp({})

        const renderPage = (page) => render(page, renderToString)

        if (import.meta.env.PROD) {
          createServer(renderPage)
        }

        export default renderPage"
      `)
    })

    it('wraps with server bootstrap for React', () => {
      const code = `import { createLunaApp } from '@lunajs/react'
createLunaApp({})`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createLunaApp } from '@lunajs/react'
        import createServer from '@lunajs/react/server'
        import { renderToString } from 'react-dom/server'

        const render = await createLunaApp({})

        const renderPage = (page) => render(page, renderToString)

        if (import.meta.env.PROD) {
          createServer(renderPage)
        }

        export default renderPage"
      `)
    })

    it('includes port, host and cluster config', () => {
      const code = `import { createLunaApp } from '@lunajs/svelte'
createLunaApp({})`

      expect(wrap(code, { port: 13715, host: '127.0.0.1', cluster: true })).toMatchInlineSnapshot(`
        "import { createLunaApp } from '@lunajs/svelte'
        import createServer from '@lunajs/svelte/server'
        import { render } from 'svelte/server'

        const ssr = await createLunaApp({})

        const renderPage = (page) => ssr(page, render)

        if (import.meta.env.PROD) {
          createServer(renderPage, {"port":13715,"host":"127.0.0.1","cluster":true})
        }

        export default renderPage"
      `)
    })

    it('returns null for non-Luna calls', () => {
      expect(wrap(`someOtherFunction({})`)).toBeNull()
    })

    it('preserves variables and code around the call', () => {
      const code = `import { createLunaApp } from '@lunajs/vue3'
import { initializeTheme } from './composables/useAppearance'

const appName = import.meta.env.VITE_APP_NAME || 'LaraGram'

createLunaApp({
    title: (title) => title ? \`\${title} - \${appName}\` : appName,
    progress: { color: '#4B5563' },
})

initializeTheme()`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createLunaApp } from '@lunajs/vue3'
        import { initializeTheme } from './composables/useAppearance'

        const appName = import.meta.env.VITE_APP_NAME || 'LaraGram'

        import createServer from '@lunajs/vue3/server'
        import { renderToString } from 'vue/server-renderer'

        const render = await createLunaApp({
            title: (title) => title ? \`\${title} - \${appName}\` : appName,
            progress: { color: '#4B5563' },
        })

        const renderPage = (page) => render(page, renderToString)

        if (import.meta.env.PROD) {
          createServer(renderPage)
        }

        export default renderPage

        initializeTheme()"
      `)
    })

    it('wraps legacy createServer pattern with import.meta.env.PROD guard', () => {
      const code = `import { createLunaApp } from '@lunajs/vue3'
import createServer from '@lunajs/vue3/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

createServer((page) =>
  createLunaApp({
    page,
    render: renderToString,
    resolve: (name) => name,
    setup({ App, props, plugin }) {
      return createSSRApp({ render: () => h(App, props) }).use(plugin)
    },
  }),
)`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createLunaApp } from '@lunajs/vue3'
        import createServer from '@lunajs/vue3/server'
        import { createSSRApp, h } from 'vue'
        import { renderToString } from 'vue/server-renderer'

        const renderPage = (page) =>
          createLunaApp({
            page,
            render: renderToString,
            resolve: (name) => name,
            setup({ App, props, plugin }) {
              return createSSRApp({ render: () => h(App, props) }).use(plugin)
            },
          })

        if (import.meta.env.PROD) {
          createServer(renderPage)
        }

        export default renderPage"
      `)
    })

    it('preserves options in legacy createServer pattern', () => {
      const code = `import createServer from '@lunajs/vue3/server'

createServer((page) => renderApp(page), { port: 13715 })`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import createServer from '@lunajs/vue3/server'

        const renderPage = (page) => renderApp(page)

        if (import.meta.env.PROD) {
          createServer(renderPage, { port: 13715 })
        }

        export default renderPage"
      `)
    })

    it('wraps void createLunaApp expression', () => {
      const code = `import { createLunaApp } from '@lunajs/react'
void createLunaApp({ resolve: (name) => name })`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createLunaApp } from '@lunajs/react'
        import createServer from '@lunajs/react/server'
        import { renderToString } from 'react-dom/server'

        const render = await createLunaApp({ resolve: (name) => name })

        const renderPage = (page) => render(page, renderToString)

        if (import.meta.env.PROD) {
          createServer(renderPage)
        }

        export default renderPage"
      `)
    })

    it('wraps void createLunaApp with .catch() chain', () => {
      const code = `import { createLunaApp } from '@lunajs/react'
void createLunaApp({ resolve: (name) => name }).catch(console.error)`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createLunaApp } from '@lunajs/react'
        import createServer from '@lunajs/react/server'
        import { renderToString } from 'react-dom/server'

        const render = await createLunaApp({ resolve: (name) => name })

        const renderPage = (page) => render(page, renderToString)

        if (import.meta.env.PROD) {
          createServer(renderPage)
        }

        export default renderPage"
      `)
    })

    it('wraps createLunaApp().catch() without void', () => {
      const code = `import { createLunaApp } from '@lunajs/react'
createLunaApp({ resolve: (name) => name }).catch(console.error)`

      expect(wrap(code)).toMatchInlineSnapshot(`
        "import { createLunaApp } from '@lunajs/react'
        import createServer from '@lunajs/react/server'
        import { renderToString } from 'react-dom/server'

        const render = await createLunaApp({ resolve: (name) => name })

        const renderPage = (page) => render(page, renderToString)

        if (import.meta.env.PROD) {
          createServer(renderPage)
        }

        export default renderPage"
      `)
    })

    it('does not transform createServer if already exported', () => {
      const code = `import { createLunaApp } from '@lunajs/vue3'
import createServer from '@lunajs/vue3/server'

export default createServer((page) => createLunaApp({ page }))`

      expect(wrap(code)).toBeNull()
    })

    it('wraps with only resolve provided (no setup)', () => {
      const code = `import { createLunaApp } from '@lunajs/vue3'
createLunaApp({
  resolve: (name) => require(\`./Pages/\${name}\`),
})`

      const result = wrap(code)
      expect(result).not.toBeNull()
      expect(result).toContain('const render = await createLunaApp')
      expect(result).toContain('resolve: (name) => require')
      expect(result).toContain('createServer(renderPage)')
    })

    it('wraps with only setup provided (no resolve)', () => {
      const code = `import { createLunaApp } from '@lunajs/vue3'
createLunaApp({
  setup({ App, props, plugin }) {
    return createSSRApp({ render: () => h(App, props) }).use(plugin)
  },
})`

      const result = wrap(code)
      expect(result).not.toBeNull()
      expect(result).toContain('const render = await createLunaApp')
      expect(result).toContain('setup({ App, props, plugin })')
    })

    it('wraps with both resolve and setup provided', () => {
      const code = `import { createLunaApp } from '@lunajs/vue3'
createLunaApp({
  resolve: (name) => require(\`./Pages/\${name}\`),
  setup({ App, props, plugin }) {
    return createSSRApp({ render: () => h(App, props) }).use(plugin)
  },
})`

      const result = wrap(code)
      expect(result).not.toBeNull()
      expect(result).toContain('const render = await createLunaApp')
      expect(result).toContain('resolve: (name) => require')
      expect(result).toContain('setup({ App, props, plugin })')
    })

    it('wraps with neither resolve nor setup', () => {
      const code = `import { createLunaApp } from '@lunajs/vue3'
createLunaApp({})`

      const result = wrap(code)
      expect(result).not.toBeNull()
      expect(result).toContain('const render = await createLunaApp({})')
    })

    it('wraps with resolve and withApp but no setup', () => {
      const code = `import { createLunaApp } from '@lunajs/vue3'
createLunaApp({
  resolve: (name) => require(\`./Pages/\${name}\`),
  withApp(app) {
    app.provide('key', 'value')
  },
})`

      const result = wrap(code)
      expect(result).not.toBeNull()
      expect(result).toContain('const render = await createLunaApp')
      expect(result).toContain('resolve: (name) => require')
      expect(result).toContain('withApp(app)')
      expect(result).toContain('createServer(renderPage)')
    })
  })

  describe('pages transform then SSR transform composition', () => {
    it('composes both transforms on a minimal call', () => {
      const code = `import { createLunaApp } from '@lunajs/vue3'
createLunaApp()`

      const afterPages = transformPages(code)
      expect(afterPages).not.toBeNull()
      expect(afterPages).toContain('resolve: async (name, page) =>')

      const afterSSR = wrap(afterPages!)
      expect(afterSSR).not.toBeNull()
      expect(afterSSR).toContain('const render = await createLunaApp')
      expect(afterSSR).toContain('resolve: async (name, page) =>')
      expect(afterSSR).toContain('createServer(renderPage)')
    })

    it('composes both transforms with pages shorthand', () => {
      const code = `import { createLunaApp } from '@lunajs/react'
createLunaApp({ pages: './Pages' })`

      const afterPages = transformPages(code)
      expect(afterPages).not.toBeNull()
      expect(afterPages).toContain('resolve: async (name, page) =>')

      const afterSSR = wrap(afterPages!)
      expect(afterSSR).not.toBeNull()
      expect(afterSSR).toContain('const render = await createLunaApp')
      expect(afterSSR).toContain('resolve: async (name, page) =>')
      expect(afterSSR).toContain("import { renderToString } from 'react-dom/server'")
    })

    it('composes both transforms with pages shorthand and withApp', () => {
      const code = `import { createLunaApp } from '@lunajs/svelte'
createLunaApp({
  pages: './Pages',
  withApp(context) {
    context.set('key', 'value')
  },
})`

      const afterPages = transformPages(code)
      expect(afterPages).not.toBeNull()
      expect(afterPages).toContain('resolve: async (name, page) =>')
      expect(afterPages).toContain('withApp(context)')

      const afterSSR = wrap(afterPages!)
      expect(afterSSR).not.toBeNull()
      expect(afterSSR).toContain('const ssr = await createLunaApp')
      expect(afterSSR).toContain('resolve: async (name, page) =>')
      expect(afterSSR).toContain('withApp(context)')
      expect(afterSSR).toContain("import { render } from 'svelte/server'")
    })

    it('skips pages transform when resolve is already present, then applies SSR transform', () => {
      const code = `import { createLunaApp } from '@lunajs/vue3'
createLunaApp({
  resolve: (name) => require(\`./Pages/\${name}\`),
})`

      expect(transformPages(code)).toBeNull()

      const afterSSR = wrap(code)
      expect(afterSSR).not.toBeNull()
      expect(afterSSR).toContain('const render = await createLunaApp')
      expect(afterSSR).toContain('resolve: (name) => require')
    })
  })
})
