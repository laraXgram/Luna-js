import {
  bindTelegramFormButton,
  getTelegramServerState,
  getTelegramState,
  initTelegramBackButton,
  initTelegramStore,
  subscribeTelegram,
  syncTelegramClosingConfirmation,
  type BindTelegramFormButtonOptions,
  type TelegramBackButtonOptions,
  type TelegramFormButtonBinding,
  type TelegramFormLike,
  type TelegramSharedProps,
  type TelegramState,
  type WebAppUser,
} from '@laraxgram/luna'
import { usePage } from './page.svelte'

/**
 * Svelte 5 (runes) bindings for the Telegram Mini App layer. Thin wrappers over
 * the framework-agnostic core store / button helpers.
 */

let telegramState = $state<TelegramState>(getTelegramServerState())
let started = false

function ensureStore(): void {
  if (started) {
    return
  }

  started = true
  initTelegramStore()
  subscribeTelegram(() => {
    telegramState = getTelegramState()
  })
  telegramState = getTelegramState()
}

/** Reactive accessor for the Telegram UI state (theme, viewport, safe-area). */
export function useTelegram(): {
  readonly current: TelegramState
  readonly colorScheme: TelegramState['colorScheme']
  readonly themeParams: TelegramState['themeParams']
  readonly viewportHeight: number
  readonly isExpanded: boolean
  readonly isFullscreen: boolean
} {
  ensureStore()

  return {
    get current() {
      return telegramState
    },
    get colorScheme() {
      return telegramState.colorScheme
    },
    get themeParams() {
      return telegramState.themeParams
    },
    get viewportHeight() {
      return telegramState.viewportHeight
    },
    get isExpanded() {
      return telegramState.isExpanded
    },
    get isFullscreen() {
      return telegramState.isFullscreen
    },
  }
}

/**
 * Sync the native BackButton with browser history. Call inside a component's
 * initialization; it wires an `$effect` for cleanup.
 */
export function useTelegramBackButton(options?: TelegramBackButtonOptions): void {
  $effect(() => initTelegramBackButton(options))
}

/**
 * Drive the Main (or Secondary) button from a Luna form. Pass a getter so the
 * reactive form state is tracked. Submit on tap, progress while submitting,
 * disabled until dirty / while invalid.
 */
export function useTelegramFormButton(
  form: () => TelegramFormLike,
  options: BindTelegramFormButtonOptions,
): void {
  let binding: TelegramFormButtonBinding | null = null

  $effect(() => {
    binding = bindTelegramFormButton(options)

    return () => {
      binding?.destroy()
      binding = null
    }
  })

  $effect(() => {
    binding?.update(form())
  })
}

/**
 * Read the server-shared Telegram context (the `telegram` prop set by the PHP
 * `SharesTelegramContext` trait). Reactive — reads the runes-backed page store.
 */
export function getTelegramSharedContext(): TelegramSharedProps | undefined {
  return (usePage().props as { telegram?: TelegramSharedProps }).telegram
}

/** The server-validated Telegram user, if the request was authenticated. */
export function getTelegramUser(): WebAppUser | undefined {
  return getTelegramSharedContext()?.user
}

/** Enable Telegram's closing confirmation while the form is dirty. */
export function useTelegramClosingConfirmation(isDirty: () => boolean): void {
  $effect(() => {
    syncTelegramClosingConfirmation(isDirty())

    return () => syncTelegramClosingConfirmation(false)
  })
}
