/**
 * React Framework Configuration
 *
 * This file defines how the Vite plugin handles React applications.
 * It serves as a reference for creating custom framework configurations.
 *
 * The SSR template shows what the plugin generates. For a user's SSR entry:
 *
 * ```js
 * import { createLunaApp } from '@laraxgram/react'
 *
 * createLunaApp({
 *   resolve: (name) => resolvePageComponent(name),
 * })
 * ```
 *
 * In production, the plugin transforms it to:
 *
 * ```js
 * import { createLunaApp } from '@laraxgram/react'
 * import createServer from '@laraxgram/react/server'
 * import { renderToString } from 'react-dom/server'
 *
 * const render = await createLunaApp({
 *   resolve: (name) => resolvePageComponent(name),
 * })
 *
 * createServer((page) => render(page, renderToString))
 * ```
 *
 * In development, it exports the render function directly for the Vite dev server.
 */

import type { FrameworkConfig } from '../types'

export const config: FrameworkConfig = {
  // Package name used to detect React usage via import statements
  package: '@laraxgram/react',

  // React components can use either .tsx (TypeScript) or .jsx
  // The plugin tries .tsx first, then falls back to .jsx
  extensions: ['.tsx', '.jsx'],

  // React components are exported as `export default`, so we need to extract .default
  extractDefault: true,

  // SSR template that wraps the createLunaApp call with server bootstrap code
  // Uses import.meta.env.PROD to skip the standalone server in dev mode
  ssr: (configureCall, options) => `
import createServer from '@laraxgram/react/server'
import { renderToString } from 'react-dom/server'

const render = await ${configureCall}

const renderPage = (page) => render(page, renderToString)

if (import.meta.env.PROD) {
  createServer(renderPage${options})
}

export default renderPage
`,
}
