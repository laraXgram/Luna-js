import { BottomButton, BottomButtonParams, HexColor } from './types'
import { webApp } from './webApp'

/**
 * Imperative controllers for the Telegram `MainButton` / `SecondaryButton`, plus
 * a form binding that drives the button from a Luna form's `processing` /
 * `isDirty` / `hasErrors` state (progress spinner while submitting, disabled
 * until the form is dirty, submit on tap).
 *
 * These are framework-agnostic primitives. The per-framework hooks (React /
 * Vue / Svelte) call `update()` on every render to keep the native button in
 * sync with reactive form state.
 */

export type BottomButtonKind = 'main' | 'secondary'

export type TelegramButtonState = {
  text?: string
  color?: HexColor
  textColor?: HexColor
  hasShineEffect?: boolean
  visible?: boolean
  active?: boolean
  /** Show the built-in progress spinner. */
  progress?: boolean
}

export interface TelegramButtonController {
  /** Apply a (partial) visual state to the button. */
  set(state: TelegramButtonState): void
  /** Register the tap handler, replacing any previous one. */
  onClick(callback: () => void): void
  /** Remove everything and hide the button. */
  destroy(): void
}

function resolveButton(kind: BottomButtonKind): BottomButton | undefined {
  const app = webApp()

  if (!app) {
    return undefined
  }

  return kind === 'secondary' ? app.SecondaryButton : app.MainButton
}

/**
 * Create an imperative controller for a bottom button. SSR-safe: outside
 * Telegram every method is a no-op.
 */
export function telegramButton(kind: BottomButtonKind): TelegramButtonController {
  const button = resolveButton(kind)
  let clickHandler: (() => void) | null = null
  let progressVisible = false

  const set = (state: TelegramButtonState): void => {
    if (!button) {
      return
    }

    const params: BottomButtonParams = {}

    if (state.text !== undefined) params.text = state.text
    if (state.color !== undefined) params.color = state.color
    if (state.textColor !== undefined) params.text_color = state.textColor
    if (state.hasShineEffect !== undefined) params.has_shine_effect = state.hasShineEffect
    if (state.visible !== undefined) params.is_visible = state.visible
    if (state.active !== undefined) params.is_active = state.active

    if (Object.keys(params).length > 0) {
      button.setParams(params)
    }

    // Progress must be toggled through its own API, not setParams.
    if (state.progress !== undefined && state.progress !== progressVisible) {
      progressVisible = state.progress

      if (state.progress) {
        button.showProgress()
      } else {
        button.hideProgress()
      }
    }
  }

  const onClick = (callback: () => void): void => {
    if (!button) {
      return
    }

    if (clickHandler) {
      button.offClick(clickHandler)
    }

    clickHandler = callback
    button.onClick(callback)
  }

  const destroy = (): void => {
    if (!button) {
      return
    }

    if (clickHandler) {
      button.offClick(clickHandler)
      clickHandler = null
    }

    if (progressVisible) {
      button.hideProgress()
      progressVisible = false
    }

    button.hide()
  }

  return { set, onClick, destroy }
}

/** The minimal slice of a Luna form the button binding reads. */
export type TelegramFormLike = {
  processing: boolean
  isDirty: boolean
  hasErrors?: boolean
}

export type BindTelegramFormButtonOptions = {
  /** Which bottom button to drive. Default: `'main'`. */
  kind?: BottomButtonKind
  /** Button label. */
  text: string
  /** Called on tap — usually the form's `submit`. */
  submit: () => void
  /**
   * Keep the button disabled until the form is dirty. Default: `true`.
   * Set `false` to always allow submission (e.g. idempotent actions).
   */
  requireDirty?: boolean
  /** Disable the button while the form has validation errors. Default: `true`. */
  disableOnErrors?: boolean
  color?: HexColor
  textColor?: HexColor
}

export interface TelegramFormButtonBinding {
  /** Re-sync the button with the current form state. Call on every render. */
  update(form: TelegramFormLike): void
  destroy(): void
}

/**
 * Bind a bottom button to a Luna form: shows the button, submits on tap, mirrors
 * `processing` to the progress spinner and gates the active state on
 * `isDirty` / `hasErrors`.
 */
export function bindTelegramFormButton(options: BindTelegramFormButtonOptions): TelegramFormButtonBinding {
  const kind = options.kind ?? 'main'
  const requireDirty = options.requireDirty ?? true
  const disableOnErrors = options.disableOnErrors ?? true

  const controller = telegramButton(kind)
  controller.onClick(() => options.submit())

  const update = (form: TelegramFormLike): void => {
    const dirtyOk = requireDirty ? form.isDirty : true
    const errorsOk = disableOnErrors ? !form.hasErrors : true
    const active = dirtyOk && errorsOk && !form.processing

    controller.set({
      text: options.text,
      color: options.color,
      textColor: options.textColor,
      visible: true,
      active,
      progress: form.processing,
    })
  }

  return {
    update,
    destroy: controller.destroy,
  }
}

/**
 * Enable Telegram's closing-confirmation dialog while a form is dirty, so the
 * user is warned before discarding unsaved changes by closing the Mini App.
 * SSR-safe. Call whenever the form's dirty state changes.
 */
export function syncTelegramClosingConfirmation(dirty: boolean): void {
  const app = webApp()

  if (!app) {
    return
  }

  if (dirty) {
    app.enableClosingConfirmation()
  } else {
    app.disableClosingConfirmation()
  }
}
