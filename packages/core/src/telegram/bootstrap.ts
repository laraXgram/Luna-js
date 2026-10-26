import { initTelegramCssVariables } from './css'
import { initTelegramBackButton, type TelegramBackButtonOptions } from './navigation'
import { requestFullscreen } from './viewport'
import { webApp } from './webApp'

/** Platforms `fullscreen: 'mobile'` applies to. */
const MOBILE_PLATFORMS = ['android', 'ios']

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
   * `history.back()` on tap. Pass options to change when it shows or what a tap
   * does. Default: true.
   *
   * While the button is hidden, Android's back gesture and back key close (or
   * minimize) the Mini App instead of going back.
   */
  backButton?: boolean | TelegramBackButtonOptions
  /**
   * Request fullscreen on launch: `true` everywhere, `'mobile'` on Android and
   * iOS only (fullscreen on a desktop client covers the whole screen). Telegram's
   * close and menu buttons then float over the page; keep content clear of them
   * with the `--tg-content-safe-area-inset-*` CSS variables. Needs Bot API 8.0.
   * Default: false.
   */
  fullscreen?: boolean | 'mobile'
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
    fullscreen = false,
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
    initTelegramBackButton(backButton === true ? {} : backButton)
  }

  if (
    (fullscreen === true || (fullscreen === 'mobile' && MOBILE_PLATFORMS.includes(app.platform)))
    && app.isVersionAtLeast('8.0')
    && !app.isFullscreen
  ) {
    // A client that refuses (e.g. unsupported) leaves the app as it is.
    requestFullscreen().catch(() => {})
  }
}

/** Reset the bootstrap guard. Intended for tests only. */
export function resetTelegramBootstrap(): void {
  booted = false
}
