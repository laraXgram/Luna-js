import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { bootstrapTelegram, resetTelegramBootstrap } from '../src/telegram/bootstrap'
import { getTelegramBackDepth, resetTelegramBackButton } from '../src/telegram/navigation'

type Listener = (payload?: unknown) => void

function makeEnv({ platform = 'android', version = '8.0', isFullscreen = false } = {}) {
  const events: Record<string, Set<Listener>> = {}
  const docListeners: Record<string, Set<Listener>> = {}
  const back = vi.fn()

  const app = {
    platform,
    version,
    isFullscreen,
    initData: 'query_id=1',
    ready: vi.fn(),
    expand: vi.fn(),
    disableVerticalSwipes: vi.fn(),
    enableClosingConfirmation: vi.fn(),
    requestFullscreen: vi.fn(() => events['fullscreenChanged']?.forEach((cb) => cb())),
    isVersionAtLeast: (wanted: string) => Number(version) >= Number(wanted),
    onEvent: (type: string, cb: Listener) => (events[type] ??= new Set()).add(cb),
    offEvent: (type: string, cb: Listener) => events[type]?.delete(cb),
    BackButton: {
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
    },
  }

  ;(globalThis as any).window = {
    Telegram: { WebApp: app },
    history: { back },
    addEventListener() {},
    removeEventListener() {},
  }
  ;(globalThis as any).document = {
    addEventListener: (type: string, cb: Listener) => (docListeners[type] ??= new Set()).add(cb),
    removeEventListener: (type: string, cb: Listener) => docListeners[type]?.delete(cb),
  }

  return { app, fireNavigate: () => docListeners['luna:navigate']?.forEach((cb) => cb()) }
}

const bootstrapOnly = { ready: false, expand: false, cssVariables: false }

beforeEach(() => {
  resetTelegramBootstrap()
  resetTelegramBackButton()
})

afterEach(() => {
  resetTelegramBackButton()
  delete (globalThis as any).window
  delete (globalThis as any).document
})

describe('bootstrapTelegram fullscreen', () => {
  it('stays windowed by default', () => {
    const env = makeEnv()
    bootstrapTelegram({ ...bootstrapOnly, backButton: false })

    expect(env.app.requestFullscreen).not.toHaveBeenCalled()
  })

  it('requests fullscreen everywhere with true', () => {
    const env = makeEnv({ platform: 'tdesktop' })
    bootstrapTelegram({ ...bootstrapOnly, backButton: false, fullscreen: true })

    expect(env.app.requestFullscreen).toHaveBeenCalledOnce()
  })

  it("requests fullscreen on phones only with 'mobile'", () => {
    const phone = makeEnv({ platform: 'ios' })
    bootstrapTelegram({ ...bootstrapOnly, backButton: false, fullscreen: 'mobile' })
    expect(phone.app.requestFullscreen).toHaveBeenCalledOnce()

    resetTelegramBootstrap()
    const desktop = makeEnv({ platform: 'macos' })
    bootstrapTelegram({ ...bootstrapOnly, backButton: false, fullscreen: 'mobile' })
    expect(desktop.app.requestFullscreen).not.toHaveBeenCalled()
  })

  it('skips clients older than Bot API 8.0 and apps already fullscreen', () => {
    const old = makeEnv({ version: '7.10' })
    bootstrapTelegram({ ...bootstrapOnly, backButton: false, fullscreen: true })
    expect(old.app.requestFullscreen).not.toHaveBeenCalled()

    resetTelegramBootstrap()
    const already = makeEnv({ isFullscreen: true })
    bootstrapTelegram({ ...bootstrapOnly, backButton: false, fullscreen: true })
    expect(already.app.requestFullscreen).not.toHaveBeenCalled()
  })
})

describe('bootstrapTelegram back button options', () => {
  it('passes back button options through', () => {
    const env = makeEnv()
    bootstrapTelegram({ ...bootstrapOnly, backButton: { canGoBack: () => true } })

    env.fireNavigate()
    expect(getTelegramBackDepth()).toBe(0)
    expect(env.app.BackButton.isVisible).toBe(true)
  })
})
