import { resolve } from 'node:path'
import type { Plugin, UserConfig } from 'vite'

export interface LunaMcpAppOptions {
  /**
   * The entry that creates the Luna app and calls `connectMcpApp()`.
   * Default: `resources/js/mcp-app.ts`.
   */
  entry?: string

  /**
   * Where the single-file build is written, relative to the project root. The
   * laraxgram/mcp `LunaAppResource` reads `app.js` and `app.css` from here.
   * Default: `bootstrap/mcp-app`.
   */
  outDir?: string
}

/**
 * Build a Luna app as a single inlinable bundle for MCP Apps.
 *
 * MCP hosts render apps in a sandboxed frame that cannot load scripts, styles or
 * lazy chunks from the application, so everything is emitted into one `app.js`
 * (pages included, no code splitting), one `app.css`, and assets are inlined as
 * data URIs. Use it in a dedicated config:
 *
 * ```js
 * // vite.mcp-app.config.js — build with: vite build --config vite.mcp-app.config.js
 * export default defineConfig({
 *   plugins: [vue(), luna({ ssr: false }), lunaMcpApp({ entry: 'resources/js/mcp-app.ts' })],
 * })
 * ```
 */
export default function lunaMcpApp(options: LunaMcpAppOptions = {}): Plugin {
  const entry = options.entry ?? 'resources/js/mcp-app.ts'
  const outDir = options.outDir ?? 'bootstrap/mcp-app'

  return {
    name: '@laraxgram/vite:mcp-app',
    enforce: 'post',
    apply: 'build',

    config(config): UserConfig {
      const root = config.root ?? process.cwd()

      const output = {
        format: 'es' as const,
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: (asset: { names?: string[]; name?: string }) =>
          (asset.names?.[0] ?? asset.name ?? '').endsWith('.css') ? 'app.css' : 'assets/[name][extname]',
      }

      return {
        base: './',
        publicDir: false,
        build: {
          outDir: resolve(root, outDir),
          emptyOutDir: true,
          manifest: false,
          ssrManifest: false,
          copyPublicDir: false,
          cssCodeSplit: false,
          modulePreload: false,
          sourcemap: false,
          assetsInlineLimit: Number.MAX_SAFE_INTEGER,
          rollupOptions: { input: resolve(root, entry), output },
          // Vite 8 (Rolldown) reads its bundler options from here.
          ...({ rolldownOptions: { input: resolve(root, entry), output } } as Record<string, unknown>),
        },
      }
    },
  }
}
