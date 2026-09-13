import { router } from './index'
import type { Page, PageProps } from './types'

/**
 * The app API exposed by the MCP host SDK (`mcp-sdk.js` of laraxgram/mcp) to an
 * MCP App running inside an AI client.
 */
export interface McpApp {
  getHostContext(): McpHostContext | null
  getHostInfo(): Record<string, unknown> | null
  getHostCapabilities(): Record<string, unknown> | null
  callServerTool(name: string | { name: string; arguments?: Record<string, unknown> }, args?: Record<string, unknown>): Promise<McpToolResult>
  listResources(cursor?: string | Record<string, unknown>): Promise<unknown>
  readResource(uri: string | { uri: string }): Promise<unknown>
  sendMessage(content: unknown, role?: 'user' | 'assistant'): Promise<unknown>
  openLink(url: string | { url: string }): Promise<unknown>
  downloadFile(contents: unknown): Promise<unknown>
  requestDisplayMode(mode: string | { mode: string }): Promise<unknown>
  updateModelContext(params?: Record<string, unknown>): Promise<unknown>
  requestTeardown(): void
  sendLog(level: string | Record<string, unknown>, data?: unknown, logger?: string): Promise<void>
  resize(): void
  autoResize(enabled?: boolean): void
  onTeardown(callback: () => unknown): void
  onCallTool(callback: (params: Record<string, unknown>) => unknown): void
  onListTools(callback: (params: Record<string, unknown>) => unknown): void
  onToolInput(callback: (params: McpToolInput) => void): void
  onToolInputPartial(callback: (params: McpToolInput) => void): void
  onToolResult(callback: (result: McpToolResult) => void): void
  onToolCancelled(callback: (params: Record<string, unknown>) => void): void
  onHostContextChanged(callback: (context: McpHostContext) => void): void
}

export interface McpToolInput {
  arguments?: Record<string, unknown>
  [key: string]: unknown
}

export interface McpToolResult {
  content?: Array<Record<string, unknown>>
  structuredContent?: Record<string, unknown> & { luna?: Page }
  isError?: boolean
  [key: string]: unknown
}

export interface McpHostContext {
  theme?: string
  displayMode?: string
  locale?: string
  [key: string]: unknown
}

export interface ConnectMcpAppOptions {
  /** The page prop receiving the arguments of the tool call that opened the app. Default: "toolInput". */
  toolInputProp?: string | false
  /** The page prop receiving the latest tool result. Default: "toolResult". */
  toolResultProp?: string | false
  /** The page prop receiving the host context (theme, display mode, locale...). Default: "hostContext". */
  hostContextProp?: string | false
  /** Swap to the Luna page carried in a tool result's `structuredContent.luna`. Default: true. */
  followPages?: boolean
}

declare global {
  interface Window {
    createMcpApp?: (setup: (app: McpApp) => void | Promise<void>) => Promise<void>
  }
}

let current: McpApp | null = null

/**
 * Determine if the page runs as an MCP App (the MCP host SDK is present).
 */
export function isMcpApp(): boolean {
  return typeof window !== 'undefined' && typeof window.createMcpApp === 'function'
}

/**
 * Get the connected MCP App, if any.
 */
export function mcpApp(): McpApp | null {
  return current
}

/**
 * Connect the Luna app to the MCP host: tool input, tool results and host context
 * are mirrored into page props, and Luna pages returned by tools are visited
 * client-side. Resolves with null when the page does not run inside an MCP host.
 *
 * Call it after the Luna app has been created.
 */
export function connectMcpApp(options: ConnectMcpAppOptions = {}): Promise<McpApp | null> {
  if (!isMcpApp()) {
    return Promise.resolve(null)
  }

  const { toolInputProp = 'toolInput', toolResultProp = 'toolResult', hostContextProp = 'hostContext', followPages = true } = options

  return new Promise((resolve, reject) => {
    window.createMcpApp!((app) => {
      current = app

      if (hostContextProp) {
        replaceProp(hostContextProp, app.getHostContext())
        app.onHostContextChanged((context) => replaceProp(hostContextProp, context))
      }

      if (toolInputProp) {
        app.onToolInput((params) => replaceProp(toolInputProp, params.arguments ?? {}))
      }

      app.onToolResult((result) => {
        if (followPages && visitPageFromResult(result)) {
          return
        }

        if (toolResultProp) {
          replaceProp(toolResultProp, result)
        }
      })

      resolve(app)
    }).catch(reject)
  })
}

/**
 * Call a server tool from the MCP App; a Luna page in the result is visited client-side.
 */
export async function callMcpTool(
  name: string,
  args: Record<string, unknown> = {},
  { followPages = true }: { followPages?: boolean } = {},
): Promise<McpToolResult> {
  if (!current) {
    throw new Error('The MCP App is not connected. Call connectMcpApp() first.')
  }

  const result = await current.callServerTool(name, args)

  if (followPages) {
    visitPageFromResult(result)
  }

  return result
}

function visitPageFromResult(result: McpToolResult | undefined): boolean {
  const page = result?.structuredContent?.luna

  if (!page || typeof page.component !== 'string') {
    return false
  }

  router.push({
    component: page.component,
    props: page.props as PageProps,
    url: page.url,
    preserveScroll: false,
    preserveState: false,
  })

  return true
}

function replaceProp(name: string, value: unknown): void {
  router.replaceProp(name, value)
}
