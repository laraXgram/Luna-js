import { WebApp, WebAppEvent, WebAppEventMap } from './types'

/**
 * Safe accessors for the Telegram Mini App SDK.
 *
 * Every function here is SSR-safe: outside a Telegram WebView (or during
 * server-side rendering) `window.Telegram.WebApp` is absent, so these degrade
 * gracefully instead of throwing.
 */

/** Get the raw WebApp instance, or undefined when not running inside Telegram. */
export function webApp(): WebApp | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.Telegram?.WebApp
}

/** Whether the app is running inside a Telegram Mini App environment. */
export function isTelegram(): boolean {
  return webApp() !== undefined
}

/**
 * The raw, signed init-data query string. Send this to the backend for
 * validation — never trust `initDataUnsafe` on its own.
 */
export function initData(): string {
  return webApp()?.initData ?? ''
}

/** The parsed (unverified) init data. Convenience only; validate server-side. */
export function initDataUnsafe(): WebApp['initDataUnsafe'] | undefined {
  return webApp()?.initDataUnsafe
}

/** Register a typed event listener; returns an unsubscribe function. */
export function onEvent<E extends WebAppEvent>(
  event: E,
  handler: (...args: WebAppEventMap[E]) => void,
): () => void {
  const app = webApp()

  if (!app) {
    return () => {}
  }

  app.onEvent(event, handler)

  return () => app.offEvent(event, handler)
}

/**
 * Run a callback with the WebApp instance only when it is available.
 * Returns the callback result, or undefined outside Telegram.
 */
export function withWebApp<T>(callback: (app: WebApp) => T): T | undefined {
  const app = webApp()

  return app ? callback(app) : undefined
}
