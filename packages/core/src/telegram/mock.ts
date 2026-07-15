import { ColorScheme, ThemeParams, WebApp, WebAppEvent } from './types'

/**
 * A functional in-browser mock of `window.Telegram.WebApp`, so a Mini App can be
 * developed and tested outside the real Telegram client. It covers the surface
 * the Luna helpers use: theme, viewport, buttons, events, storage, dialogs and
 * the fullscreen / home-screen flows.
 *
 * This is a development aid — never rely on it in production, and remember the
 * real security boundary is server-side `initData` validation, which a mock
 * cannot satisfy.
 */

export type TelegramMockOptions = {
  colorScheme?: ColorScheme
  themeParams?: ThemeParams
  viewportHeight?: number
  /** Value returned by `initDataUnsafe`. `initData` is always empty for a mock. */
  initDataUnsafe?: WebApp['initDataUnsafe']
  platform?: string
  version?: string
}

const DEFAULT_LIGHT_THEME: ThemeParams = {
  bg_color: '#ffffff',
  text_color: '#000000',
  hint_color: '#707579',
  link_color: '#3390ec',
  button_color: '#3390ec',
  button_text_color: '#ffffff',
  secondary_bg_color: '#f4f4f5',
}

function createMock(options: TelegramMockOptions): WebApp {
  const handlers: Partial<Record<WebAppEvent, Set<(...args: unknown[]) => void>>> = {}

  const emit = (event: WebAppEvent, ...args: unknown[]): void => {
    handlers[event]?.forEach((handler) => handler(...args))
  }

  const storage = () => {
    const map = new Map<string, string>()

    return {
      setItem(key: string, value: string, cb?: (e: string | null, ok?: boolean) => void) {
        map.set(key, value)
        cb?.(null, true)
        return this
      },
      getItem(key: string, cb: (e: string | null, v?: string) => void) {
        cb(null, map.get(key) ?? '')
      },
      getItems(keys: string[], cb: (e: string | null, v?: Record<string, string>) => void) {
        cb(null, Object.fromEntries(keys.map((k) => [k, map.get(k) ?? ''])))
      },
      removeItem(key: string, cb?: (e: string | null, ok?: boolean) => void) {
        map.delete(key)
        cb?.(null, true)
        return this
      },
      removeItems(keys: string[], cb?: (e: string | null, ok?: boolean) => void) {
        keys.forEach((k) => map.delete(k))
        cb?.(null, true)
        return this
      },
      getKeys(cb: (e: string | null, v?: string[]) => void) {
        cb(null, [...map.keys()])
      },
      clear(cb?: (e: string | null, ok?: boolean) => void) {
        map.clear()
        cb?.(null, true)
        return this
      },
      restoreItem(key: string, cb?: (e: string | null, v?: string) => void) {
        cb?.(null, map.get(key) ?? '')
        return this
      },
    }
  }

  const makeBottomButton = (type: 'main' | 'secondary'): WebApp['MainButton'] => {
    const clicks = new Set<() => void>()
    const event = type === 'main' ? 'mainButtonClicked' : 'secondaryButtonClicked'
    const button = {
      type,
      text: type === 'main' ? 'CONTINUE' : '',
      color: (options.themeParams?.button_color ?? '#3390ec') as WebApp['MainButton']['color'],
      textColor: (options.themeParams?.button_text_color ?? '#ffffff') as WebApp['MainButton']['textColor'],
      isVisible: false,
      isActive: true,
      isProgressVisible: false,
      hasShineEffect: false,
      setText(value: string) {
        button.text = value
        return button
      },
      onClick(cb: () => void) {
        clicks.add(cb)
        return button
      },
      offClick(cb: () => void) {
        clicks.delete(cb)
        return button
      },
      show() {
        button.isVisible = true
        return button
      },
      hide() {
        button.isVisible = false
        return button
      },
      enable() {
        button.isActive = true
        return button
      },
      disable() {
        button.isActive = false
        return button
      },
      showProgress() {
        button.isProgressVisible = true
        return button
      },
      hideProgress() {
        button.isProgressVisible = false
        return button
      },
      setParams(params: Record<string, unknown>) {
        if (params.text !== undefined) button.text = params.text as string
        if (params.is_visible !== undefined) button.isVisible = params.is_visible as boolean
        if (params.is_active !== undefined) button.isActive = params.is_active as boolean
        return button
      },
    }

    // Let dev tools trigger the click via a global for convenience.
    ;(button as unknown as { click: () => void }).click = () => {
      clicks.forEach((cb) => cb())
      emit(event as WebAppEvent)
    }

    return button as unknown as WebApp['MainButton']
  }

  const backClicks = new Set<() => void>()

  // Typed loosely: the mock mutates several fields the real SDK exposes as
  // readonly, and is cast to `WebApp` on return.
  const app: Record<string, any> = {
    initData: '',
    initDataUnsafe: options.initDataUnsafe ?? ({ auth_date: Math.floor(Date.now() / 1000), hash: '' } as WebApp['initDataUnsafe']),
    version: options.version ?? '8.0',
    platform: options.platform ?? 'web',
    colorScheme: options.colorScheme ?? 'light',
    themeParams: options.themeParams ?? DEFAULT_LIGHT_THEME,
    isActive: true,
    isExpanded: true,
    viewportHeight: options.viewportHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 800),
    viewportStableHeight: options.viewportHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 800),
    isFullscreen: false,
    isOrientationLocked: false,
    safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    contentSafeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    headerColor: '#ffffff',
    backgroundColor: '#ffffff',
    bottomBarColor: '#ffffff',
    isClosingConfirmationEnabled: false,
    isVerticalSwipesEnabled: true,
    BackButton: {
      isVisible: false,
      onClick(cb: () => void) {
        backClicks.add(cb)
        return this
      },
      offClick(cb: () => void) {
        backClicks.delete(cb)
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
    } as WebApp['BackButton'],
    MainButton: makeBottomButton('main'),
    SecondaryButton: makeBottomButton('secondary'),
    SettingsButton: {
      isVisible: false,
      onClick() {
        return this
      },
      offClick() {
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
    } as WebApp['SettingsButton'],
    HapticFeedback: {
      impactOccurred() {
        return this
      },
      notificationOccurred() {
        return this
      },
      selectionChanged() {
        return this
      },
    } as WebApp['HapticFeedback'],
    CloudStorage: storage() as unknown as WebApp['CloudStorage'],
    DeviceStorage: storage() as unknown as WebApp['DeviceStorage'],
    SecureStorage: storage() as unknown as WebApp['SecureStorage'],
    onEvent(event: WebAppEvent, handler: (...args: unknown[]) => void) {
      ;(handlers[event] ??= new Set()).add(handler)
    },
    offEvent(event: WebAppEvent, handler: (...args: unknown[]) => void) {
      handlers[event]?.delete(handler)
    },
    ready() {},
    expand() {
      app.isExpanded = true
    },
    close() {},
    isVersionAtLeast() {
      return true
    },
    setHeaderColor() {},
    setBackgroundColor() {},
    setBottomBarColor() {},
    enableClosingConfirmation() {
      app.isClosingConfirmationEnabled = true
    },
    disableClosingConfirmation() {
      app.isClosingConfirmationEnabled = false
    },
    enableVerticalSwipes() {},
    disableVerticalSwipes() {},
    requestFullscreen() {
      app.isFullscreen = true
      emit('fullscreenChanged')
    },
    exitFullscreen() {
      app.isFullscreen = false
      emit('fullscreenChanged')
    },
    lockOrientation() {},
    unlockOrientation() {},
    addToHomeScreen() {
      emit('homeScreenAdded')
    },
    checkHomeScreenStatus(cb?: (status: string) => void) {
      cb?.('missed')
    },
    sendData() {},
    switchInlineQuery() {},
    openLink() {},
    openTelegramLink() {},
    openInvoice(_url: string, cb?: (status: string) => void) {
      cb?.('paid')
    },
    shareToStory() {},
    shareMessage(_id: string, cb?: (sent: boolean) => void) {
      cb?.(true)
    },
    downloadFile(_p: unknown, cb?: (ok: boolean) => void) {
      cb?.(true)
    },
    setEmojiStatus(_id: string, _p: unknown, cb?: (ok: boolean) => void) {
      cb?.(true)
    },
    requestEmojiStatusAccess(cb?: (granted: boolean) => void) {
      cb?.(true)
    },
    requestChat(_id: number, cb?: (shared: boolean) => void) {
      cb?.(true)
    },
    showPopup(params: { buttons?: Array<{ id?: string }> }, cb?: (id: string | null) => void) {
      const id = params.buttons?.[0]?.id ?? null
      cb?.(id)
    },
    showAlert(message: string, cb?: () => void) {
      if (typeof window !== 'undefined') window.alert(message)
      cb?.()
    },
    showConfirm(message: string, cb?: (confirmed: boolean) => void) {
      cb?.(typeof window !== 'undefined' ? window.confirm(message) : true)
    },
    showScanQrPopup() {},
    closeScanQrPopup() {},
    readTextFromClipboard(cb?: (text: string | null) => void) {
      cb?.(null)
    },
    hideKeyboard() {},
    requestWriteAccess(cb?: (granted: boolean) => void) {
      cb?.(true)
    },
    requestContact(cb?: (shared: boolean) => void) {
      cb?.(true)
    },
  }

  return app as WebApp
}

/**
 * Install the mock at `window.Telegram.WebApp` if it is not already present.
 * No-op during SSR or when a real Telegram context exists. Returns whether the
 * mock was installed.
 */
export function installTelegramMock(options: TelegramMockOptions = {}): boolean {
  if (typeof window === 'undefined' || window.Telegram?.WebApp) {
    return false
  }

  window.Telegram = { WebApp: createMock(options) }

  return true
}
