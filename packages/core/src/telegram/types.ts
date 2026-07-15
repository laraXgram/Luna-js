/**
 * Type definitions for the Telegram Mini App JS SDK exposed at
 * `window.Telegram.WebApp` by telegram-web-app.js.
 *
 * @see https://core.telegram.org/bots/webapps
 */

export type ColorScheme = 'light' | 'dark'

/** #RRGGBB hex string or a theme keyword accepted by setHeaderColor etc. */
export type HexColor = `#${string}`

export type ThemeParams = {
  bg_color?: HexColor
  text_color?: HexColor
  hint_color?: HexColor
  link_color?: HexColor
  button_color?: HexColor
  button_text_color?: HexColor
  secondary_bg_color?: HexColor
  header_bg_color?: HexColor
  bottom_bar_bg_color?: HexColor
  accent_text_color?: HexColor
  section_bg_color?: HexColor
  section_header_text_color?: HexColor
  section_separator_color?: HexColor
  subtitle_text_color?: HexColor
  destructive_text_color?: HexColor
} & Record<string, HexColor | undefined>

export type WebAppUser = {
  id: number
  is_bot?: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  added_to_attachment_menu?: boolean
  allows_write_to_pm?: boolean
  photo_url?: string
}

export type WebAppChat = {
  id: number
  type: 'group' | 'supergroup' | 'channel'
  title: string
  username?: string
  photo_url?: string
}

export type WebAppInitData = {
  query_id?: string
  user?: WebAppUser
  receiver?: WebAppUser
  chat?: WebAppChat
  chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel'
  chat_instance?: string
  start_param?: string
  can_send_after?: number
  auth_date: number
  signature?: string
  hash: string
}

/**
 * Shape of the `telegram` prop the PHP `SharesTelegramContext` trait auto-shares
 * on every Luna response once a request is authenticated. Read it on the client
 * via `useTelegramUser()` / `usePage().props.telegram`.
 */
export type TelegramSharedProps = {
  user?: WebAppUser
  chat?: WebAppChat
  receiver?: WebAppUser
  startParam?: string | null
  chatType?: string | null
  chatInstance?: string | null
}

export type SafeAreaInset = {
  top: number
  bottom: number
  left: number
  right: number
}

export type ContentSafeAreaInset = SafeAreaInset

export type PopupButtonType = 'default' | 'ok' | 'close' | 'cancel' | 'destructive'

export type PopupButton = {
  id?: string
  type?: PopupButtonType
  text?: string
}

export type PopupParams = {
  title?: string
  message: string
  buttons?: PopupButton[]
}

export type ScanQrPopupParams = {
  text?: string
}

export type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
export type HapticNotificationType = 'error' | 'success' | 'warning'

export type BottomButtonPosition = 'left' | 'right' | 'top' | 'bottom'

export type BottomButtonParams = {
  text?: string
  color?: HexColor
  text_color?: HexColor
  has_shine_effect?: boolean
  position?: BottomButtonPosition
  is_active?: boolean
  is_visible?: boolean
}

export interface BottomButton {
  readonly type: 'main' | 'secondary'
  text: string
  color: HexColor
  textColor: HexColor
  isVisible: boolean
  isActive: boolean
  isProgressVisible: boolean
  hasShineEffect: boolean
  iconCustomEmojiId?: string
  position?: BottomButtonPosition
  setText(text: string): BottomButton
  onClick(callback: () => void): BottomButton
  offClick(callback: () => void): BottomButton
  show(): BottomButton
  hide(): BottomButton
  enable(): BottomButton
  disable(): BottomButton
  showProgress(leaveActive?: boolean): BottomButton
  hideProgress(): BottomButton
  setParams(params: BottomButtonParams): BottomButton
}

export interface BackButton {
  isVisible: boolean
  onClick(callback: () => void): BackButton
  offClick(callback: () => void): BackButton
  show(): BackButton
  hide(): BackButton
}

export interface SettingsButton {
  isVisible: boolean
  onClick(callback: () => void): SettingsButton
  offClick(callback: () => void): SettingsButton
  show(): SettingsButton
  hide(): SettingsButton
}

export interface HapticFeedback {
  impactOccurred(style: HapticImpactStyle): HapticFeedback
  notificationOccurred(type: HapticNotificationType): HapticFeedback
  selectionChanged(): HapticFeedback
}

export type CloudStorageCallback<T> = (error: string | null, result?: T) => void

export interface CloudStorage {
  setItem(key: string, value: string, callback?: CloudStorageCallback<boolean>): CloudStorage
  getItem(key: string, callback: CloudStorageCallback<string>): void
  getItems(keys: string[], callback: CloudStorageCallback<Record<string, string>>): void
  removeItem(key: string, callback?: CloudStorageCallback<boolean>): CloudStorage
  removeItems(keys: string[], callback?: CloudStorageCallback<boolean>): CloudStorage
  getKeys(callback: CloudStorageCallback<string[]>): void
}

export interface DeviceStorage {
  setItem(key: string, value: string, callback?: CloudStorageCallback<boolean>): DeviceStorage
  getItem(key: string, callback: CloudStorageCallback<string>): void
  removeItem(key: string, callback?: CloudStorageCallback<boolean>): DeviceStorage
  clear(callback?: CloudStorageCallback<boolean>): DeviceStorage
}

export interface SecureStorage {
  setItem(key: string, value: string, callback?: CloudStorageCallback<boolean>): SecureStorage
  getItem(key: string, callback: (error: string | null, value?: string, canRestore?: boolean) => void): void
  restoreItem(key: string, callback?: CloudStorageCallback<string>): SecureStorage
  removeItem(key: string, callback?: CloudStorageCallback<boolean>): SecureStorage
  clear(callback?: CloudStorageCallback<boolean>): SecureStorage
}

export type BiometricType = 'finger' | 'face' | 'unknown'

export type BiometricRequestAccessParams = { reason?: string }
export type BiometricAuthenticateParams = { reason?: string }

export interface BiometricManager {
  readonly isInited: boolean
  readonly isBiometricAvailable: boolean
  readonly biometricType: BiometricType
  readonly isAccessRequested: boolean
  readonly isAccessGranted: boolean
  readonly isBiometricTokenSaved: boolean
  readonly deviceId: string
  init(callback?: () => void): BiometricManager
  requestAccess(params: BiometricRequestAccessParams, callback?: (granted: boolean) => void): BiometricManager
  authenticate(
    params: BiometricAuthenticateParams,
    callback?: (success: boolean, token?: string) => void,
  ): BiometricManager
  updateBiometricToken(token: string, callback?: (updated: boolean) => void): BiometricManager
  openSettings(): BiometricManager
}

export type AccelerometerStartParams = { refresh_rate?: number }

export interface Accelerometer {
  readonly isStarted: boolean
  readonly x: number
  readonly y: number
  readonly z: number
  start(params?: AccelerometerStartParams, callback?: (started: boolean) => void): Accelerometer
  stop(callback?: (stopped: boolean) => void): Accelerometer
}

export type DeviceOrientationStartParams = { refresh_rate?: number; need_absolute?: boolean }

export interface DeviceOrientation {
  readonly isStarted: boolean
  readonly absolute: boolean
  readonly alpha: number
  readonly beta: number
  readonly gamma: number
  start(params?: DeviceOrientationStartParams, callback?: (started: boolean) => void): DeviceOrientation
  stop(callback?: (stopped: boolean) => void): DeviceOrientation
}

export type GyroscopeStartParams = { refresh_rate?: number }

export interface Gyroscope {
  readonly isStarted: boolean
  readonly x: number
  readonly y: number
  readonly z: number
  start(params?: GyroscopeStartParams, callback?: (started: boolean) => void): Gyroscope
  stop(callback?: (stopped: boolean) => void): Gyroscope
}

export type LocationData = {
  latitude: number
  longitude: number
  altitude: number | null
  course: number | null
  speed: number | null
  horizontal_accuracy: number | null
  vertical_accuracy: number | null
  course_accuracy: number | null
  speed_accuracy: number | null
}

export interface LocationManager {
  readonly isInited: boolean
  readonly isLocationAvailable: boolean
  readonly isAccessRequested: boolean
  readonly isAccessGranted: boolean
  init(callback?: () => void): LocationManager
  getLocation(callback: (data: LocationData | null) => void): LocationManager
  openSettings(): LocationManager
}

export type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending'

export type ShareStoryParams = {
  text?: string
  widget_link?: { url: string; name?: string }
}

export type EmojiStatusParams = { duration?: number }

/** Payload map for typed onEvent / offEvent handlers. */
export type WebAppEventMap = {
  activated: []
  deactivated: []
  themeChanged: []
  viewportChanged: [{ isStateStable: boolean }]
  safeAreaChanged: []
  contentSafeAreaChanged: []
  mainButtonClicked: []
  secondaryButtonClicked: []
  backButtonClicked: []
  settingsButtonClicked: []
  invoiceClosed: [{ url: string; status: InvoiceStatus }]
  popupClosed: [{ button_id: string | null }]
  qrTextReceived: [{ data: string }]
  scanQrPopupClosed: []
  clipboardTextReceived: [{ data: string | null }]
  writeAccessRequested: [{ status: 'allowed' | 'cancelled' }]
  contactRequested: [{ status: 'sent' | 'cancelled' }]
  biometricManagerUpdated: []
  biometricAuthRequested: [{ isAuthenticated: boolean; biometricToken?: string }]
  biometricTokenUpdated: [{ isUpdated: boolean }]
  fullscreenChanged: []
  fullscreenFailed: [{ error: 'UNSUPPORTED' | 'ALREADY_FULLSCREEN' }]
  homeScreenAdded: []
  homeScreenChecked: [{ status: 'unsupported' | 'unknown' | 'added' | 'missed' }]
  accelerometerStarted: []
  accelerometerStopped: []
  accelerometerChanged: []
  accelerometerFailed: [{ error: string }]
  deviceOrientationStarted: []
  deviceOrientationStopped: []
  deviceOrientationChanged: []
  deviceOrientationFailed: [{ error: string }]
  gyroscopeStarted: []
  gyroscopeStopped: []
  gyroscopeChanged: []
  gyroscopeFailed: [{ error: string }]
  locationManagerUpdated: []
  locationRequested: [{ locationData: LocationData | null }]
  shareMessageSent: []
  shareMessageFailed: [{ error: string }]
  emojiStatusSet: []
  emojiStatusFailed: [{ error: string }]
  emojiStatusAccessRequested: [{ status: 'allowed' | 'cancelled' }]
  fileDownloadRequested: [{ status: 'downloading' | 'cancelled' }]
}

export type WebAppEvent = keyof WebAppEventMap

export interface WebApp {
  // Data
  readonly initData: string
  readonly initDataUnsafe: WebAppInitData
  readonly version: string
  readonly platform: string
  readonly colorScheme: ColorScheme
  readonly themeParams: ThemeParams

  // Viewport
  readonly isActive: boolean
  readonly isExpanded: boolean
  readonly viewportHeight: number
  readonly viewportStableHeight: number
  readonly isFullscreen: boolean
  readonly isOrientationLocked: boolean
  readonly safeAreaInset: SafeAreaInset
  readonly contentSafeAreaInset: ContentSafeAreaInset

  // Appearance
  headerColor: HexColor
  backgroundColor: HexColor
  bottomBarColor: HexColor
  isClosingConfirmationEnabled: boolean
  isVerticalSwipesEnabled: boolean

  // Controls
  readonly BackButton: BackButton
  readonly MainButton: BottomButton
  readonly SecondaryButton: BottomButton
  readonly SettingsButton: SettingsButton
  readonly HapticFeedback: HapticFeedback
  readonly CloudStorage: CloudStorage
  readonly DeviceStorage: DeviceStorage
  readonly SecureStorage: SecureStorage
  readonly BiometricManager: BiometricManager
  readonly Accelerometer: Accelerometer
  readonly DeviceOrientation: DeviceOrientation
  readonly Gyroscope: Gyroscope
  readonly LocationManager: LocationManager

  // Events
  onEvent<E extends WebAppEvent>(event: E, handler: (...args: WebAppEventMap[E]) => void): void
  offEvent<E extends WebAppEvent>(event: E, handler: (...args: WebAppEventMap[E]) => void): void

  // Lifecycle
  ready(): void
  expand(): void
  close(): void
  isVersionAtLeast(version: string): boolean

  // Appearance methods
  setHeaderColor(color: HexColor | 'bg_color' | 'secondary_bg_color'): void
  setBackgroundColor(color: HexColor | 'bg_color' | 'secondary_bg_color'): void
  setBottomBarColor(color: HexColor | 'bg_color' | 'secondary_bg_color' | 'bottom_bar_bg_color'): void
  enableClosingConfirmation(): void
  disableClosingConfirmation(): void
  enableVerticalSwipes(): void
  disableVerticalSwipes(): void

  // Fullscreen / orientation / home screen
  requestFullscreen(): void
  exitFullscreen(): void
  lockOrientation(): void
  unlockOrientation(): void
  addToHomeScreen(): void
  checkHomeScreenStatus(callback?: (status: string) => void): void

  // Navigation & sharing
  sendData(data: string): void
  switchInlineQuery(query: string, chooseChatTypes?: Array<'users' | 'bots' | 'groups' | 'channels'>): void
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string): void
  openInvoice(url: string, callback?: (status: InvoiceStatus) => void): void
  shareToStory(mediaUrl: string, params?: ShareStoryParams): void
  shareMessage(msgId: string, callback?: (sent: boolean) => void): void
  downloadFile(params: { url: string; file_name: string }, callback?: (accepted: boolean) => void): void
  setEmojiStatus(customEmojiId: string, params?: EmojiStatusParams, callback?: (success: boolean) => void): void
  requestEmojiStatusAccess(callback?: (granted: boolean) => void): void
  requestChat(reqId: number, callback?: (shared: boolean) => void): void

  // Dialogs
  showPopup(params: PopupParams, callback?: (buttonId: string | null) => void): void
  showAlert(message: string, callback?: () => void): void
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void
  showScanQrPopup(params: ScanQrPopupParams, callback?: (text: string) => boolean | void): void
  closeScanQrPopup(): void
  readTextFromClipboard(callback?: (text: string | null) => void): void
  hideKeyboard(): void

  // Permissions
  requestWriteAccess(callback?: (granted: boolean) => void): void
  requestContact(callback?: (shared: boolean) => void): void
}

export type TelegramNamespace = {
  WebApp: WebApp
}

declare global {
  interface Window {
    Telegram?: TelegramNamespace
  }
}
