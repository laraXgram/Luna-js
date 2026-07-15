import { webApp } from './webApp'

/**
 * Wires the Telegram `BackButton` to Luna's browser-history navigation.
 *
 * The Mini App runs on top of Luna's server-driven SPA, which uses the real
 * `history` stack. This tracks how deep into that stack the user has pushed and
 * shows the native back button whenever there is somewhere to go back to,
 * hiding it on the entry page. Tapping it triggers `history.back()` (which Luna
 * turns into a `popstate` visit), so no extra routing wiring is needed.
 */

export type TelegramBackButtonOptions = {
  /**
   * Custom handler for a back-button tap. When provided it fully replaces the
   * default `history.back()` behaviour.
   */
  onBack?: () => void
  /**
   * Override the visibility rule. Return `true` to show the button. Defaults to
   * the internal navigation-depth tracker (`depth > 0`).
   */
  canGoBack?: () => boolean
}

const NAVIGATE_EVENT = 'luna:navigate'

let depth = 0
// Skip the very first `navigate` (the initial page load) so the entry page
// starts with the back button hidden.
let seenInitialNavigate = false
let pendingPopstate = false
let initialized = false
let teardown: (() => void) | null = null

let onBack: (() => void) | null = null
let canGoBack: (() => boolean) | null = null

/** Current navigation depth relative to the entry page (0 = at the entry). */
export function getTelegramBackDepth(): number {
  return depth
}

function shouldShow(): boolean {
  return canGoBack ? canGoBack() : depth > 0
}

function sync(): void {
  const app = webApp()

  if (!app) {
    return
  }

  if (shouldShow()) {
    app.BackButton.show()
  } else {
    app.BackButton.hide()
  }
}

function handleBackClick(): void {
  if (onBack) {
    onBack()
    return
  }

  if (typeof window !== 'undefined') {
    window.history.back()
  }
}

function handlePopstate(): void {
  pendingPopstate = true
}

function handleNavigate(): void {
  // The initial page load fires one `navigate`; treat it as the baseline.
  if (!seenInitialNavigate) {
    seenInitialNavigate = true
    sync()
    return
  }

  if (pendingPopstate) {
    pendingPopstate = false
    depth = Math.max(0, depth - 1)
  } else {
    // `navigate` never fires for `replace` visits, so any event here that is
    // not a popstate is a genuine forward push.
    depth += 1
  }

  sync()
}

/**
 * Start syncing the Telegram back button with browser history.
 *
 * Idempotent and SSR-safe (a no-op outside Telegram). Should be called before
 * the app mounts — `bootstrapTelegram` does this automatically. Returns a
 * teardown function.
 */
export function initTelegramBackButton(options: TelegramBackButtonOptions = {}): () => void {
  const app = webApp()

  if (!app || typeof window === 'undefined') {
    return () => {}
  }

  onBack = options.onBack ?? null
  canGoBack = options.canGoBack ?? null

  if (initialized) {
    sync()
    return teardown ?? (() => {})
  }

  initialized = true

  window.addEventListener('popstate', handlePopstate)
  document.addEventListener(NAVIGATE_EVENT, handleNavigate)
  app.BackButton.onClick(handleBackClick)

  sync()

  teardown = () => {
    window.removeEventListener('popstate', handlePopstate)
    document.removeEventListener(NAVIGATE_EVENT, handleNavigate)
    app.BackButton.offClick(handleBackClick)
    app.BackButton.hide()
    initialized = false
    teardown = null
    onBack = null
    canGoBack = null
  }

  return teardown
}

/** Reset the back-button tracker. Intended for tests only. */
export function resetTelegramBackButton(): void {
  teardown?.()
  depth = 0
  seenInitialNavigate = false
  pendingPopstate = false
  initialized = false
  teardown = null
  onBack = null
  canGoBack = null
}
