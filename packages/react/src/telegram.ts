import {
  bindTelegramFormButton,
  getTelegramServerState,
  getTelegramState,
  initTelegramBackButton,
  initTelegramStore,
  subscribeTelegram,
  syncTelegramClosingConfirmation,
  type BindTelegramFormButtonOptions,
  type ColorScheme,
  type TelegramBackButtonOptions,
  type TelegramFormButtonBinding,
  type TelegramFormLike,
  type TelegramSharedProps,
  type TelegramState,
  type ThemeParams,
  type WebAppUser,
} from '@laraxgram/luna'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import usePage from './usePage'

/**
 * React bindings for the Telegram Mini App layer. Thin wrappers over the
 * framework-agnostic core store / button helpers.
 */

/** Subscribe to the reactive Telegram UI state (theme, viewport, safe-area). */
export function useTelegram(): TelegramState {
  useEffect(() => initTelegramStore(), [])

  return useSyncExternalStore(subscribeTelegram, getTelegramState, getTelegramServerState)
}

/** Just the theme slice of the Telegram state. */
export function useTelegramTheme(): { colorScheme: ColorScheme; themeParams: ThemeParams } {
  const { colorScheme, themeParams } = useTelegram()

  return { colorScheme, themeParams }
}

/** Just the viewport slice of the Telegram state. */
export function useTelegramViewport(): {
  height: number
  stableHeight: number
  isStable: boolean
  isExpanded: boolean
  isFullscreen: boolean
} {
  const state = useTelegram()

  return {
    height: state.viewportHeight,
    stableHeight: state.viewportStableHeight,
    isStable: state.viewportIsStable,
    isExpanded: state.isExpanded,
    isFullscreen: state.isFullscreen,
  }
}

/** Sync the native BackButton with browser history for the component's lifetime. */
export function useTelegramBackButton(options?: TelegramBackButtonOptions): void {
  const onBack = options?.onBack
  const canGoBack = options?.canGoBack

  useEffect(() => {
    return initTelegramBackButton({ onBack, canGoBack })
  }, [onBack, canGoBack])
}

/**
 * Drive the Main (or Secondary) button from a Luna form: submit on tap, progress
 * spinner while submitting, disabled until dirty / while invalid.
 */
export function useTelegramFormButton(form: TelegramFormLike, options: BindTelegramFormButtonOptions): void {
  const bindingRef = useRef<TelegramFormButtonBinding | null>(null)

  useEffect(() => {
    const binding = bindTelegramFormButton(options)
    bindingRef.current = binding

    return () => {
      binding.destroy()
      bindingRef.current = null
    }
    // Bind once for the component's lifetime; `update` below reflects state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bindingRef.current?.update(form)
  }, [form.processing, form.isDirty, form.hasErrors])
}

/**
 * Read the server-shared Telegram context (the `telegram` prop set by the PHP
 * `SharesTelegramContext` trait). This is the trusted, server-validated user —
 * prefer it over `initDataUnsafe` on the client.
 */
export function useTelegramSharedContext(): TelegramSharedProps | undefined {
  return (usePage().props as { telegram?: TelegramSharedProps }).telegram
}

/** The server-validated Telegram user, if the request was authenticated. */
export function useTelegramUser(): WebAppUser | undefined {
  return useTelegramSharedContext()?.user
}

/** Enable Telegram's closing confirmation while `dirty` is true. */
export function useTelegramClosingConfirmation(dirty: boolean): void {
  useEffect(() => {
    syncTelegramClosingConfirmation(dirty)

    return () => syncTelegramClosingConfirmation(false)
  }, [dirty])
}
