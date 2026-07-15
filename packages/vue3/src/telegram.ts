import {
  bindTelegramFormButton,
  getTelegramState,
  initTelegramBackButton,
  initTelegramStore,
  subscribeTelegram,
  syncTelegramClosingConfirmation,
  type BindTelegramFormButtonOptions,
  type TelegramBackButtonOptions,
  type TelegramFormLike,
  type TelegramSharedProps,
  type TelegramState,
  type WebAppUser,
} from '@laraxgram/luna'
import { computed, onScopeDispose, readonly, shallowRef, watch, type ComputedRef, type Ref } from 'vue'
import { usePage } from './app'

/**
 * Vue 3 composables for the Telegram Mini App layer. Thin wrappers over the
 * framework-agnostic core store / button helpers.
 */

/** Reactive Telegram UI state (theme, viewport, safe-area). */
export function useTelegram(): Readonly<Ref<TelegramState>> {
  const state = shallowRef(getTelegramState())

  initTelegramStore()

  const unsubscribe = subscribeTelegram(() => {
    state.value = getTelegramState()
  })

  onScopeDispose(unsubscribe)

  return readonly(state)
}

/** Reactive theme slice. */
export function useTelegramTheme(): ComputedRef<{ colorScheme: TelegramState['colorScheme']; themeParams: TelegramState['themeParams'] }> {
  const state = useTelegram()

  return computed(() => ({ colorScheme: state.value.colorScheme, themeParams: state.value.themeParams }))
}

/** Reactive viewport slice. */
export function useTelegramViewport(): ComputedRef<{
  height: number
  stableHeight: number
  isStable: boolean
  isExpanded: boolean
  isFullscreen: boolean
}> {
  const state = useTelegram()

  return computed(() => ({
    height: state.value.viewportHeight,
    stableHeight: state.value.viewportStableHeight,
    isStable: state.value.viewportIsStable,
    isExpanded: state.value.isExpanded,
    isFullscreen: state.value.isFullscreen,
  }))
}

/** Sync the native BackButton with browser history for the scope's lifetime. */
export function useTelegramBackButton(options?: TelegramBackButtonOptions): void {
  const teardown = initTelegramBackButton(options)

  onScopeDispose(teardown)
}

/**
 * Drive the Main (or Secondary) button from a reactive Luna form: submit on tap,
 * progress spinner while submitting, disabled until dirty / while invalid.
 */
export function useTelegramFormButton(form: TelegramFormLike, options: BindTelegramFormButtonOptions): void {
  const binding = bindTelegramFormButton(options)

  watch(
    () => ({ processing: form.processing, isDirty: form.isDirty, hasErrors: form.hasErrors }),
    (snapshot) => binding.update(snapshot),
    { immediate: true },
  )

  onScopeDispose(() => binding.destroy())
}

/**
 * Reactive server-shared Telegram context (the `telegram` prop set by the PHP
 * `SharesTelegramContext` trait) — the trusted, server-validated user.
 */
export function useTelegramSharedContext(): ComputedRef<TelegramSharedProps | undefined> {
  const page = usePage()

  return computed(() => (page.props as { telegram?: TelegramSharedProps }).telegram)
}

/** The reactive server-validated Telegram user, if authenticated. */
export function useTelegramUser(): ComputedRef<WebAppUser | undefined> {
  const context = useTelegramSharedContext()

  return computed(() => context.value?.user)
}

/** Enable Telegram's closing confirmation while the form is dirty. */
export function useTelegramClosingConfirmation(isDirty: Ref<boolean> | (() => boolean)): void {
  watch(
    typeof isDirty === 'function' ? isDirty : () => isDirty.value,
    (dirty) => syncTelegramClosingConfirmation(dirty),
    { immediate: true },
  )

  onScopeDispose(() => syncTelegramClosingConfirmation(false))
}
