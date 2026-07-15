import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initTelegramCssVariables } from '../src/telegram/css'
import { getTelegramState, resetTelegramStore } from '../src/telegram/store'

type Handler = (payload?: unknown) => void

function makeFakeWebApp() {
  const handlers: Record<string, Set<Handler>> = {}

  const app = {
    colorScheme: 'dark' as 'dark' | 'light',
    themeParams: { bg_color: '#111111', text_color: '#ffffff' } as Record<string, string>,
    isActive: true,
    isExpanded: false,
    isFullscreen: false,
    viewportHeight: 600,
    viewportStableHeight: 580,
    safeAreaInset: { top: 10, right: 0, bottom: 0, left: 0 },
    contentSafeAreaInset: { top: 5, right: 0, bottom: 0, left: 0 },
    onEvent(event: string, handler: Handler) {
      ;(handlers[event] ??= new Set()).add(handler)
    },
    offEvent(event: string, handler: Handler) {
      handlers[event]?.delete(handler)
    },
    ready() {},
    expand() {},
  }

  const fire = (event: string, payload?: unknown) => handlers[event]?.forEach((h) => h(payload))

  return { app, fire }
}

let cssVars: Record<string, string>

beforeEach(() => {
  cssVars = {}
  ;(globalThis as any).document = {
    documentElement: { style: { setProperty: (k: string, v: string) => (cssVars[k] = v) } },
  }
  resetTelegramStore()
})

afterEach(() => {
  resetTelegramStore()
  delete (globalThis as any).window
  delete (globalThis as any).document
})

describe('telegram reactive store + css variables', () => {
  it('writes initial theme, viewport and safe-area variables', () => {
    const { app } = makeFakeWebApp()
    ;(globalThis as any).window = { Telegram: { WebApp: app } }

    initTelegramCssVariables()

    expect(cssVars['--tg-color-scheme']).toBe('dark')
    expect(cssVars['--tg-theme-bg-color']).toBe('#111111')
    expect(cssVars['--tg-theme-text-color']).toBe('#ffffff')
    expect(cssVars['--tg-viewport-stable-height']).toBe('580px')
    expect(cssVars['--tg-safe-area-inset-top']).toBe('10px')
    expect(cssVars['--tg-content-safe-area-inset-top']).toBe('5px')
    expect(getTelegramState().colorScheme).toBe('dark')
  })

  it('reacts to themeChanged', () => {
    const { app, fire } = makeFakeWebApp()
    ;(globalThis as any).window = { Telegram: { WebApp: app } }
    initTelegramCssVariables()

    app.colorScheme = 'light'
    app.themeParams = { bg_color: '#eeeeee' }
    fire('themeChanged')

    expect(getTelegramState().colorScheme).toBe('light')
    expect(cssVars['--tg-color-scheme']).toBe('light')
    expect(cssVars['--tg-theme-bg-color']).toBe('#eeeeee')
  })

  it('reacts to viewportChanged with stability flag', () => {
    const { app, fire } = makeFakeWebApp()
    ;(globalThis as any).window = { Telegram: { WebApp: app } }
    initTelegramCssVariables()

    app.viewportHeight = 700
    app.isExpanded = true
    fire('viewportChanged', { isStateStable: false })

    const state = getTelegramState()
    expect(state.viewportHeight).toBe(700)
    expect(state.isExpanded).toBe(true)
    expect(state.viewportIsStable).toBe(false)
    expect(cssVars['--tg-viewport-height']).toBe('700px')
  })

  it('reacts to safeAreaChanged and activation events', () => {
    const { app, fire } = makeFakeWebApp()
    ;(globalThis as any).window = { Telegram: { WebApp: app } }
    initTelegramCssVariables()

    app.safeAreaInset = { top: 20, right: 1, bottom: 2, left: 3 }
    fire('safeAreaChanged')
    expect(cssVars['--tg-safe-area-inset-top']).toBe('20px')
    expect(cssVars['--tg-safe-area-inset-left']).toBe('3px')

    fire('deactivated')
    expect(getTelegramState().isActive).toBe(false)
    fire('activated')
    expect(getTelegramState().isActive).toBe(true)
  })

  it('is a no-op outside Telegram (SSR-safe)', () => {
    // no window.Telegram
    ;(globalThis as any).window = {}
    const teardown = initTelegramCssVariables()
    expect(getTelegramState().viewportHeight).toBe(0)
    expect(cssVars['--tg-color-scheme']).toBe('light')
    teardown()
  })
})
