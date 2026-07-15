import { getTelegramState, initTelegramStore, subscribeTelegram, TelegramState } from './store'

/**
 * Reflects the reactive Telegram state onto CSS custom properties on the
 * document root, so styling can be pure CSS:
 *
 *   background: var(--tg-theme-bg-color);
 *   padding-top: var(--tg-safe-area-inset-top);
 *   min-height: var(--tg-viewport-stable-height);
 *
 * Telegram's own SDK sets some of these on newer clients; writing them here as
 * well is idempotent and guarantees a consistent set (theme, viewport, and —
 * crucially — safe-area insets) across every client version.
 */

function root(): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null
  }

  return document.documentElement
}

/** Write the full set of `--tg-*` custom properties from a state snapshot. */
export function writeTelegramCssVariables(state: TelegramState): void {
  const el = root()

  if (!el) {
    return
  }

  const set = (name: string, value: string) => el.style.setProperty(name, value)

  set('--tg-color-scheme', state.colorScheme)

  for (const [key, value] of Object.entries(state.themeParams)) {
    if (typeof value === 'string') {
      set(`--tg-theme-${key.replace(/_/g, '-')}`, value)
    }
  }

  set('--tg-viewport-height', `${state.viewportHeight}px`)
  set('--tg-viewport-stable-height', `${state.viewportStableHeight}px`)

  const insets: Array<[string, keyof TelegramState]> = [
    ['--tg-safe-area-inset', 'safeAreaInset'],
    ['--tg-content-safe-area-inset', 'contentSafeAreaInset'],
  ]

  for (const [prefix, prop] of insets) {
    const inset = state[prop] as { top: number; right: number; bottom: number; left: number }
    set(`${prefix}-top`, `${inset.top}px`)
    set(`${prefix}-right`, `${inset.right}px`)
    set(`${prefix}-bottom`, `${inset.bottom}px`)
    set(`${prefix}-left`, `${inset.left}px`)
  }
}

/**
 * Initialize the store and keep the CSS variables in sync with it.
 * Idempotent and SSR-safe. Returns a teardown that stops syncing.
 */
export function initTelegramCssVariables(): () => void {
  const stopStore = initTelegramStore()

  writeTelegramCssVariables(getTelegramState())

  const unsubscribe = subscribeTelegram(() => {
    writeTelegramCssVariables(getTelegramState())
  })

  return () => {
    unsubscribe()
    stopStore()
  }
}
