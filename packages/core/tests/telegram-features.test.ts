import { afterEach, describe, expect, it, vi } from 'vitest'
import { biometric } from '../src/telegram/biometric'
import { cloudStorage, secureStorage } from '../src/telegram/storage'
import { haptic } from '../src/telegram/haptics'
import { openInvoice } from '../src/telegram/invoice'
import { popup, scanQr } from '../src/telegram/popups'
import { request } from '../src/telegram/sharing'
import { TelegramUnavailableError } from '../src/telegram/support'
import { installTelegramMock } from '../src/telegram/mock'
import { requestFullscreen } from '../src/telegram/viewport'

type Handler = (payload?: unknown) => void

function makeApp() {
  const handlers: Record<string, Set<Handler>> = {}

  return {
    store: {} as Record<string, string>,
    onEvent(event: string, h: Handler) {
      ;(handlers[event] ??= new Set()).add(h)
    },
    offEvent(event: string, h: Handler) {
      handlers[event]?.delete(h)
    },
    fire(event: string, payload?: unknown) {
      handlers[event]?.forEach((h) => h(payload))
    },
    CloudStorage: {
      setItem(key: string, value: string, cb?: (e: string | null, ok?: boolean) => void) {
        cb?.(null, true)
      },
      getItem(key: string, cb: (e: string | null, v?: string) => void) {
        key === 'boom' ? cb('read failed') : cb(null, 'value:' + key)
      },
      getItems() {},
      removeItem() {},
      removeItems() {},
      getKeys() {},
    },
    SecureStorage: {
      setItem() {},
      getItem(key: string, cb: (e: string | null, v?: string, canRestore?: boolean) => void) {
        cb(null, 'secret', true)
      },
      restoreItem() {},
      removeItem() {},
      clear() {},
    },
    BiometricManager: {
      isInited: true,
      isBiometricAvailable: true,
      biometricType: 'face' as const,
      isAccessRequested: false,
      isAccessGranted: false,
      isBiometricTokenSaved: false,
      deviceId: 'dev',
      init(cb?: () => void) {
        cb?.()
        return this
      },
      requestAccess(_p: unknown, cb?: (g: boolean) => void) {
        cb?.(true)
        return this
      },
      authenticate(_p: unknown, cb?: (ok: boolean, token?: string) => void) {
        cb?.(true, 'tok')
        return this
      },
      updateBiometricToken() {
        return this
      },
      openSettings() {
        return this
      },
    },
    HapticFeedback: {
      impactOccurred: vi.fn(),
      notificationOccurred: vi.fn(),
      selectionChanged: vi.fn(),
    },
    showPopup(_p: unknown, cb?: (id: string | null) => void) {
      cb?.('ok')
    },
    showAlert(_m: string, cb?: () => void) {
      cb?.()
    },
    showConfirm(_m: string, cb?: (v: boolean) => void) {
      cb?.(true)
    },
    scanClose: vi.fn(),
    closeScanQrPopup() {
      this.scanClose()
    },
    showScanQrPopup(_p: unknown, cb?: (text: string) => boolean | void) {
      // Emit one non-matching then one matching code.
      cb?.('skip')
      cb?.('MATCH')
    },
    readTextFromClipboard() {},
    requestContact(cb?: (v: boolean) => void) {
      cb?.(true)
    },
    openInvoice(_url: string, cb?: (s: string) => void) {
      cb?.('paid')
    },
    requestFullscreen: vi.fn(),
  }
}

function install(app: unknown) {
  ;(globalThis as any).window = { Telegram: { WebApp: app } }
}

afterEach(() => {
  delete (globalThis as any).window
})

describe('storage wrappers', () => {
  it('resolves cloudStorage.getItem', async () => {
    install(makeApp())
    await expect(cloudStorage.getItem('a')).resolves.toBe('value:a')
  })

  it('rejects cloudStorage.getItem on SDK error', async () => {
    install(makeApp())
    await expect(cloudStorage.getItem('boom')).rejects.toThrow('read failed')
  })

  it('resolves secureStorage.getItem with canRestore flag', async () => {
    install(makeApp())
    await expect(secureStorage.getItem('k')).resolves.toEqual({ value: 'secret', canRestore: true })
  })

  it('rejects with TelegramUnavailableError outside Telegram', async () => {
    ;(globalThis as any).window = {}
    await expect(cloudStorage.setItem('a', 'b')).rejects.toBeInstanceOf(TelegramUnavailableError)
  })
})

describe('biometric + haptics', () => {
  it('reports availability and authenticates', async () => {
    install(makeApp())
    expect(biometric.isAvailable()).toBe(true)
    await expect(biometric.authenticate({ reason: 'x' })).resolves.toEqual({ ok: true, token: 'tok' })
  })

  it('haptics are a no-op outside Telegram', () => {
    ;(globalThis as any).window = {}
    expect(() => haptic.impact('light')).not.toThrow()
  })
})

describe('dialogs', () => {
  it('confirm resolves boolean', async () => {
    install(makeApp())
    await expect(popup.confirm('sure?')).resolves.toBe(true)
  })

  it('scanQr skips non-matches, accepts and closes', async () => {
    const app = makeApp()
    install(app)
    const result = await scanQr({ accept: (d) => d === 'MATCH' })
    expect(result).toBe('MATCH')
    expect(app.scanClose).toHaveBeenCalled()
  })
})

describe('invoice + requests + fullscreen', () => {
  it('openInvoice resolves final status', async () => {
    install(makeApp())
    await expect(openInvoice('https://t.me/invoice')).resolves.toBe('paid')
  })

  it('request.contact resolves', async () => {
    install(makeApp())
    await expect(request.contact()).resolves.toBe(true)
  })

  it('requestFullscreen resolves on fullscreenChanged', async () => {
    const app = makeApp()
    install(app)
    const promise = requestFullscreen()
    expect(app.requestFullscreen).toHaveBeenCalled()
    app.fire('fullscreenChanged')
    await expect(promise).resolves.toBeUndefined()
  })

  it('requestFullscreen rejects on fullscreenFailed', async () => {
    const app = makeApp()
    install(app)
    const promise = requestFullscreen()
    app.fire('fullscreenFailed', { error: 'UNSUPPORTED' })
    await expect(promise).rejects.toThrow('UNSUPPORTED')
  })
})

describe('mock SDK', () => {
  it('installs a mock when none exists and drives wrappers', async () => {
    ;(globalThis as any).window = {}
    expect(installTelegramMock({ colorScheme: 'dark' })).toBe(true)
    expect((globalThis as any).window.Telegram.WebApp.colorScheme).toBe('dark')

    // A promise wrapper works against the mock's in-memory storage.
    await expect(cloudStorage.setItem('k', 'v')).resolves.toBe(true)
    await expect(cloudStorage.getItem('k')).resolves.toBe('v')
  })

  it('does not overwrite a real Telegram context', () => {
    install(makeApp())
    expect(installTelegramMock()).toBe(false)
  })
})
