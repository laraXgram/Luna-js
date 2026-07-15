import { initTelegramCssVariables } from './css'
import { initTelegramBackButton } from './navigation'
import { webApp } from './webApp'

export type TelegramBootstrapOptions = {
  /** Call WebApp.ready() to signal the app is loaded. Default: true. */
  ready?: boolean
  /** Call WebApp.expand() to maximize the viewport. Default: true. */
  expand?: boolean
  /** Enable the closing confirmation dialog. Default: false. */
  closingConfirmation?: boolean
  /** Disable vertical swipe-to-close. Default: false. */
  disableVerticalSwipes?: boolean
  /**
   * Mirror theme, viewport and safe-area state onto `--tg-*` CSS variables and
   * keep them reactive. Default: true.
   */
  cssVariables?: boolean
  /**
   * Sync the native BackButton with Luna's browser-history navigation: show it
   * when there is somewhere to go back to, hide it on the entry page, and run
   * `history.back()` on tap. Default: true.
   */
  backButton?: boolean
}

let booted = false

/**
 * Initialize the Telegram Mini App runtime.
 *
 * Call this once, before mounting the app. It signals readiness and expands
 * the viewport so the Mini App fills the available height. It is a no-op
 * outside a Telegram WebView, so it is always safe to call.
 */
export function bootstrapTelegram(options: TelegramBootstrapOptions = {}): void {
  const app = webApp()

  if (!app || booted) {
    return
  }

  booted = true

  const {
    ready = true,
    expand = true,
    closingConfirmation = false,
    disableVerticalSwipes = false,
    cssVariables = true,
    backButton = true,
  } = options

  if (ready) {
    app.ready()
  }

  if (expand) {
    app.expand()
  }

  if (closingConfirmation) {
    app.enableClosingConfirmation()
  }

  if (disableVerticalSwipes) {
    app.disableVerticalSwipes()
  }

  if (cssVariables) {
    initTelegramCssVariables()
  }

  if (backButton) {
    initTelegramBackButton()
  }
}

/** Reset the bootstrap guard. Intended for tests only. */
export function resetTelegramBootstrap(): void {
  booted = false
}
