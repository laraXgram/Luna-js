import { ColorScheme, SafeAreaInset, ThemeParams } from './types'
import { onEvent, webApp } from './webApp'

/**
 * A framework-agnostic snapshot of the reactive Telegram UI state.
 *
 * The object identity changes on every update, so it plugs directly into
 * React's `useSyncExternalStore`, Vue's `shallowRef`, or a Svelte store.
 */
export type TelegramState = {
  colorScheme: ColorScheme
  themeParams: ThemeParams
  isActive: boolean
  isExpanded: boolean
  isFullscreen: boolean
  viewportHeight: number
  viewportStableHeight: number
  viewportIsStable: boolean
  safeAreaInset: SafeAreaInset
  contentSafeAreaInset: SafeAreaInset
}

const EMPTY_INSET: SafeAreaInset = { top: 0, bottom: 0, left: 0, right: 0 }

const DEFAULT_STATE: TelegramState = {
  colorScheme: 'light',
  themeParams: {},
  isActive: true,
  isExpanded: false,
  isFullscreen: false,
  viewportHeight: 0,
  viewportStableHeight: 0,
  viewportIsStable: true,
  safeAreaInset: EMPTY_INSET,
  contentSafeAreaInset: EMPTY_INSET,
}

type Listener = () => void

let state: TelegramState = DEFAULT_STATE
const listeners = new Set<Listener>()
let initialized = false
let teardown: (() => void) | null = null

/** The current immutable state snapshot. */
export function getTelegramState(): TelegramState {
  return state
}

/** Server-side / non-Telegram default snapshot (stable identity). */
export function getTelegramServerState(): TelegramState {
  return DEFAULT_STATE
}

/** Subscribe to state changes; returns an unsubscribe function. */
export function subscribeTelegram(listener: Listener): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function commit(patch: Partial<TelegramState>): void {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

function readState(): TelegramState {
  const app = webApp()

  if (!app) {
    return DEFAULT_STATE
  }

  return {
    colorScheme: app.colorScheme,
    themeParams: app.themeParams ?? {},
    isActive: app.isActive ?? true,
    isExpanded: app.isExpanded,
    isFullscreen: app.isFullscreen ?? false,
    viewportHeight: app.viewportHeight,
    viewportStableHeight: app.viewportStableHeight,
    viewportIsStable: true,
    safeAreaInset: app.safeAreaInset ?? EMPTY_INSET,
    contentSafeAreaInset: app.contentSafeAreaInset ?? EMPTY_INSET,
  }
}

/**
 * Initialize the reactive store: read the current values and wire up the
 * Telegram event listeners that keep the state in sync. Idempotent and
 * SSR-safe (a no-op outside Telegram). Returns an unsubscribe/teardown.
 */
export function initTelegramStore(): () => void {
  const app = webApp()

  if (!app || initialized) {
    return teardown ?? (() => {})
  }

  initialized = true
  state = readState()

  const unsubscribers = [
    onEvent('themeChanged', () => {
      commit({ colorScheme: app.colorScheme, themeParams: app.themeParams ?? {} })
    }),
    onEvent('viewportChanged', (payload) => {
      commit({
        viewportHeight: app.viewportHeight,
        viewportStableHeight: app.viewportStableHeight,
        isExpanded: app.isExpanded,
        viewportIsStable: payload?.isStateStable ?? true,
      })
    }),
    onEvent('safeAreaChanged', () => {
      commit({ safeAreaInset: app.safeAreaInset ?? EMPTY_INSET })
    }),
    onEvent('contentSafeAreaChanged', () => {
      commit({ contentSafeAreaInset: app.contentSafeAreaInset ?? EMPTY_INSET })
    }),
    onEvent('fullscreenChanged', () => {
      commit({ isFullscreen: app.isFullscreen ?? false })
    }),
    onEvent('activated', () => commit({ isActive: true })),
    onEvent('deactivated', () => commit({ isActive: false })),
  ]

  // Notify once so subscribers pick up the freshly-read initial state.
  listeners.forEach((listener) => listener())

  teardown = () => {
    unsubscribers.forEach((off) => off())
    initialized = false
    teardown = null
  }

  return teardown
}

/** Reset the store. Intended for tests only. */
export function resetTelegramStore(): void {
  teardown?.()
  state = DEFAULT_STATE
  listeners.clear()
  initialized = false
  teardown = null
}
