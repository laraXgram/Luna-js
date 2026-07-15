import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  bindTelegramFormButton,
  syncTelegramClosingConfirmation,
  telegramButton,
} from '../src/telegram/buttons'
import {
  getTelegramBackDepth,
  initTelegramBackButton,
  resetTelegramBackButton,
} from '../src/telegram/navigation'

type Listener = (payload?: unknown) => void

function makeBackButton() {
  return {
    isVisible: false,
    clicks: new Set<() => void>(),
    onClick(cb: () => void) {
      this.clicks.add(cb)
      return this
    },
    offClick(cb: () => void) {
      this.clicks.delete(cb)
      return this
    },
    show() {
      this.isVisible = true
      return this
    },
    hide() {
      this.isVisible = false
      return this
    },
    tap() {
      this.clicks.forEach((cb) => cb())
    },
  }
}

function makeBottomButton() {
  return {
    params: {} as Record<string, unknown>,
    progressVisible: false,
    clicks: new Set<() => void>(),
    isVisible: false,
    setParams(params: Record<string, unknown>) {
      this.params = { ...this.params, ...params }
      if (params.is_visible !== undefined) this.isVisible = params.is_visible as boolean
      return this
    },
    showProgress() {
      this.progressVisible = true
      return this
    },
    hideProgress() {
      this.progressVisible = false
      return this
    },
    onClick(cb: () => void) {
      this.clicks.add(cb)
      return this
    },
    offClick(cb: () => void) {
      this.clicks.delete(cb)
      return this
    },
    hide() {
      this.isVisible = false
      return this
    },
    tap() {
      this.clicks.forEach((cb) => cb())
    },
  }
}

function makeEnv() {
  const winListeners: Record<string, Set<Listener>> = {}
  const docListeners: Record<string, Set<Listener>> = {}
  const back = vi.fn()

  const win = {
    Telegram: undefined as any,
    history: { back },
    addEventListener: (type: string, cb: Listener) => (winListeners[type] ??= new Set()).add(cb),
    removeEventListener: (type: string, cb: Listener) => winListeners[type]?.delete(cb),
  }

  const doc = {
    addEventListener: (type: string, cb: Listener) => (docListeners[type] ??= new Set()).add(cb),
    removeEventListener: (type: string, cb: Listener) => docListeners[type]?.delete(cb),
  }

  const app = {
    BackButton: makeBackButton(),
    MainButton: makeBottomButton(),
    SecondaryButton: makeBottomButton(),
    enableClosingConfirmation: vi.fn(),
    disableClosingConfirmation: vi.fn(),
  }

  win.Telegram = { WebApp: app }
  ;(globalThis as any).window = win
  ;(globalThis as any).document = doc

  return {
    app,
    back,
    firePopstate: () => winListeners['popstate']?.forEach((cb) => cb()),
    fireNavigate: () => docListeners['luna:navigate']?.forEach((cb) => cb()),
  }
}

beforeEach(() => {
  resetTelegramBackButton()
})

afterEach(() => {
  resetTelegramBackButton()
  delete (globalThis as any).window
  delete (globalThis as any).document
})

describe('telegram back button ↔ history', () => {
  it('hides on the entry page and shows after forward navigation', () => {
    const env = makeEnv()
    initTelegramBackButton()

    // Initial page load fires one navigate; back button stays hidden.
    env.fireNavigate()
    expect(env.app.BackButton.isVisible).toBe(false)
    expect(getTelegramBackDepth()).toBe(0)

    // Forward push.
    env.fireNavigate()
    expect(getTelegramBackDepth()).toBe(1)
    expect(env.app.BackButton.isVisible).toBe(true)
  })

  it('decrements depth on popstate (back navigation)', () => {
    const env = makeEnv()
    initTelegramBackButton()

    env.fireNavigate() // initial
    env.fireNavigate() // push -> depth 1
    env.fireNavigate() // push -> depth 2
    expect(getTelegramBackDepth()).toBe(2)

    env.firePopstate()
    env.fireNavigate() // popstate-driven navigate -> depth 1
    expect(getTelegramBackDepth()).toBe(1)
    expect(env.app.BackButton.isVisible).toBe(true)

    env.firePopstate()
    env.fireNavigate() // -> depth 0
    expect(getTelegramBackDepth()).toBe(0)
    expect(env.app.BackButton.isVisible).toBe(false)
  })

  it('calls history.back() on tap by default', () => {
    const env = makeEnv()
    initTelegramBackButton()
    env.fireNavigate()
    env.fireNavigate()

    env.app.BackButton.tap()
    expect(env.back).toHaveBeenCalledOnce()
  })

  it('uses a custom onBack handler instead of history.back()', () => {
    const env = makeEnv()
    const onBack = vi.fn()
    initTelegramBackButton({ onBack })
    env.fireNavigate()
    env.fireNavigate()

    env.app.BackButton.tap()
    expect(onBack).toHaveBeenCalledOnce()
    expect(env.back).not.toHaveBeenCalled()
  })

  it('is a no-op outside Telegram', () => {
    ;(globalThis as any).window = { history: { back: vi.fn() } }
    ;(globalThis as any).document = { addEventListener() {}, removeEventListener() {} }
    const teardown = initTelegramBackButton()
    expect(getTelegramBackDepth()).toBe(0)
    teardown()
  })
})

describe('telegram bottom button form binding', () => {
  it('shows the button, disables until dirty, mirrors processing to progress', () => {
    const env = makeEnv()
    const submit = vi.fn()
    const binding = bindTelegramFormButton({ text: 'Save', submit })

    binding.update({ processing: false, isDirty: false, hasErrors: false })
    expect(env.app.MainButton.params.text).toBe('Save')
    expect(env.app.MainButton.params.is_visible).toBe(true)
    expect(env.app.MainButton.params.is_active).toBe(false) // not dirty

    binding.update({ processing: false, isDirty: true, hasErrors: false })
    expect(env.app.MainButton.params.is_active).toBe(true)

    binding.update({ processing: true, isDirty: true, hasErrors: false })
    expect(env.app.MainButton.progressVisible).toBe(true)
    expect(env.app.MainButton.params.is_active).toBe(false) // disabled while processing
  })

  it('disables the button when the form has errors', () => {
    const env = makeEnv()
    const binding = bindTelegramFormButton({ text: 'Save', submit: vi.fn() })
    binding.update({ processing: false, isDirty: true, hasErrors: true })
    expect(env.app.MainButton.params.is_active).toBe(false)
  })

  it('submits on tap', () => {
    const env = makeEnv()
    const submit = vi.fn()
    bindTelegramFormButton({ text: 'Save', submit })
    env.app.MainButton.tap()
    expect(submit).toHaveBeenCalledOnce()
  })

  it('can drive the secondary button', () => {
    const env = makeEnv()
    const binding = bindTelegramFormButton({ kind: 'secondary', text: 'Cancel', submit: vi.fn() })
    binding.update({ processing: false, isDirty: true })
    expect(env.app.SecondaryButton.params.text).toBe('Cancel')
    expect(env.app.MainButton.params.text).toBeUndefined()
  })
})

describe('telegram closing confirmation on dirty forms', () => {
  it('enables while dirty, disables when clean', () => {
    const env = makeEnv()
    syncTelegramClosingConfirmation(true)
    expect(env.app.enableClosingConfirmation).toHaveBeenCalledOnce()
    syncTelegramClosingConfirmation(false)
    expect(env.app.disableClosingConfirmation).toHaveBeenCalledOnce()
  })
})

describe('telegramButton controller', () => {
  it('is a no-op outside Telegram', () => {
    delete (globalThis as any).window
    const controller = telegramButton('main')
    expect(() => {
      controller.set({ text: 'x' })
      controller.onClick(() => {})
      controller.destroy()
    }).not.toThrow()
  })
})
