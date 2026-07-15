/**
 * Luna.js Vite Plugin
 *
 * This plugin provides two main features:
 *
 * 1. **Pages shorthand** - Transforms `pages: './Pages'` into a full `resolve` function
 *    that uses `import.meta.glob` to load page components. This saves users from writing
 *    boilerplate glob code in every project.
 *
 * 2. **SSR dev server** - During development, wraps the SSR entry file with server bootstrap
 *    code and exposes an HTTP endpoint that LaraGram can call to render pages server-side.
 *    This eliminates the need to run a separate Node.js SSR server during development.
 *
 * The plugin is framework-agnostic - it detects which Luna adapter (Vue, React, Svelte)
 * is being used by looking at import statements, then applies the appropriate transforms.
 * Custom frameworks can be added via the `frameworks` option.
 */

import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { glob } from 'tinyglobby'
import type { Plugin, ViteDevServer } from 'vite'
import { defaultFrameworks } from './frameworks/index'
import { transformPageResolution } from './pagesTransform'
import { handleSSRRequest, LunaSSROptions, resolveSSREntry, SSR_ENDPOINT, SSR_ENTRY_CANDIDATES } from './ssr'
import { findLunaAppExport, wrapWithServerBootstrap } from './ssrTransform'
import type { FrameworkConfig } from './types'

export type { FrameworkConfig, SSRTemplate } from './types'
export { LunaSSROptions }

export interface LunaPluginOptions {
  /**
   * SSR configuration. Pass a string for the entry path, an object for
   * additional options, or `false` to disable SSR entirely. Auto-detected
   * when not specified from:
   * - resources/js/ssr.{ts,tsx,js,jsx}
   * - src/ssr.{ts,tsx,js,jsx}
   * - resources/js/app.{ts,tsx,js,jsx}
   * - src/app.{ts,tsx,js,jsx}
   */
  ssr?: string | false | LunaSSROptions

  /**
   * Custom framework configurations. Use this to add support for frameworks
   * beyond the built-in Vue, React, and Svelte adapters.
   *
   * @example
   * ```ts
   * luna({
   *   frameworks: {
   *     package: '@laraxgram/solid',
   *     extensions: ['.tsx', '.jsx'],
   *     extractDefault: true,
   *     ssr: (configureCall, options) => `
   *       import createServer from '@laraxgram/solid/server'
   *       const render = await ${configureCall}
   *       createServer((page) => render(page)${options})
   *     `,
   *   }
   * })
   * ```
   */
  frameworks?: FrameworkConfig | FrameworkConfig[]

  /**
   * Telegram Mini App support. Pass `true` to inject the official
   * `telegram-web-app.js` SDK, or an object for finer control (including the
   * in-browser dev mock so the app runs outside the Telegram client).
   */
  telegram?: boolean | TelegramPluginOptions
}

export interface TelegramPluginOptions {
  /** Inject the `telegram-web-app.js` script tag into the page head. Default: true. */
  inject?: boolean
  /** SDK script URL. Default: `https://telegram.org/js/telegram-web-app.js`. */
  src?: string
  /**
   * Install the in-browser mock SDK during **dev** when no real Telegram
   * context is present, so the Mini App is runnable in a plain browser. Pass an
   * object to seed the mock (colorScheme, themeParams, …). Default: false.
   */
  mock?: boolean | Record<string, unknown>
}

const TELEGRAM_SDK_URL = 'https://telegram.org/js/telegram-web-app.js'

/**
 * Normalize the frameworks option into a record keyed by package name.
 */
function toFrameworkRecord(input?: FrameworkConfig | FrameworkConfig[]): Record<string, FrameworkConfig> {
  if (!input) {
    return {}
  }

  const configs = Array.isArray(input) ? input : [input]

  return Object.fromEntries(configs.map((config) => [config.package, config]))
}

/**
 * Warm up page component files so Vite discovers their dependencies upfront.
 *
 * The pages shorthand (or default) is transformed into import.meta.glob during the transform
 * hook, which is too late for Vite's initial dependency scanner. Without warmup, first
 * navigation to a lazy-loaded page can trigger a disruptive re-optimization.
 */
async function warmupPageFiles(server: ViteDevServer, sourceFile: string, pageGlobs: string[]): Promise<void> {
  const files = await glob(pageGlobs, { cwd: dirname(sourceFile), absolute: true })

  files.forEach((file) => server.warmupRequest(file))
}

export default function luna(options: LunaPluginOptions = {}): Plugin {
  const ssrDisabled = options.ssr === false
  const ssr = typeof options.ssr === 'string' ? { entry: options.ssr } : options.ssr || {}
  const frameworks = { ...defaultFrameworks, ...toFrameworkRecord(options.frameworks) }

  const telegramEnabled = !!options.telegram
  const telegram: TelegramPluginOptions = options.telegram === true ? {} : options.telegram || {}

  let entry: string | null = null
  let devServer: ViteDevServer | null = null

  return {
    name: '@laraxgram/vite',

    transformIndexHtml: {
      order: 'pre' as const,
      handler(html: string, ctx: { server?: ViteDevServer }) {
        if (!telegramEnabled) {
          return
        }

        const tags: Array<{
          tag: string
          attrs?: Record<string, string | boolean>
          children?: string
          injectTo: 'head' | 'head-prepend'
        }> = []

        if (telegram.inject !== false) {
          tags.push({
            tag: 'script',
            attrs: { src: telegram.src ?? TELEGRAM_SDK_URL },
            injectTo: 'head-prepend',
          })
        }

        // Dev-only mock: runs after the SDK script and only fills in when there
        // is no real Telegram context (checked inside installTelegramMock).
        if (ctx.server && telegram.mock) {
          const seed = typeof telegram.mock === 'object' ? JSON.stringify(telegram.mock) : '{}'
          tags.push({
            tag: 'script',
            attrs: { type: 'module' },
            children: `import { installTelegramMock } from '@laraxgram/luna'; installTelegramMock(${seed})`,
            injectTo: 'head',
          })
        }

        return { html, tags }
      },
    },

    config(config, env) {
      if (ssrDisabled || !env.isSsrBuild) {
        return
      }

      const root = config.root ?? process.cwd()
      const ssrEntry = ssr.entry ?? SSR_ENTRY_CANDIDATES.find((candidate) => existsSync(resolve(root, candidate)))

      return {
        build: {
          sourcemap: ssr.sourcemap !== false ? (config.build?.sourcemap ?? true) : undefined,
          rollupOptions: ssrEntry
            ? {
                input: config.build?.rollupOptions?.input ?? (config.build as any)?.rolldownOptions?.input ?? ssrEntry,
              }
            : undefined,
        },
      }
    },

    configResolved(config) {
      if (ssrDisabled) {
        return
      }

      entry = resolveSSREntry(ssr, config)

      if (entry && config.build?.ssr) {
        config.logger.info(`Luna SSR entry: ${entry}`)
      }
    },

    transform(code, id, options) {
      if (!/\.[jt]sx?$/.test(id)) {
        return null
      }

      let result = code

      if (!ssrDisabled && options?.ssr && findLunaAppExport(result)) {
        result =
          wrapWithServerBootstrap(
            result,
            { port: ssr.port, host: ssr.host, cluster: ssr.cluster, formatErrors: ssr.formatErrors },
            frameworks,
          ) ?? result
      }

      const pageTransform = transformPageResolution(result, frameworks)

      if (pageTransform) {
        if (devServer && pageTransform.pageGlobs.length > 0) {
          warmupPageFiles(devServer, id, pageTransform.pageGlobs).catch(() => {})
        }

        return pageTransform.code
      }

      return result !== code ? result : null
    },

    configureServer(server) {
      devServer = server
      server.httpServer?.on('connection', (socket) => socket.setNoDelay(true))

      if (!entry) {
        return
      }

      let warmingUp = false

      server.middlewares.use(SSR_ENDPOINT, async (req, res, next) => {
        if (req.method !== 'POST') {
          return next()
        }

        if (warmingUp) {
          server.config.logger.info('SSR skipped, module graph is still warming up...')
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(null))
          return
        }

        await handleSSRRequest(server, entry!, req, res, ssr.formatErrors ?? true)
      })

      server.config.logger.info(`Luna SSR dev endpoint: ${SSR_ENDPOINT}`)

      server.httpServer?.once('listening', () => {
        warmingUp = true
        server.config.logger.info('Warming up Luna SSR module graph...')

        server
          .ssrLoadModule(entry!)
          .then(() => server.config.logger.info('Luna SSR module graph warmed up'))
          .catch((error) =>
            server.config.logger.warn(`Failed to warm up Luna SSR module graph: ${error?.message ?? error}`),
          )
          .finally(() => {
            warmingUp = false
          })
      })
    },
  }
}
