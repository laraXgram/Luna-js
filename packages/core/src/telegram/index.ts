export { bootstrapTelegram, resetTelegramBootstrap, type TelegramBootstrapOptions } from './bootstrap'
export { initData, initDataUnsafe, isTelegram, onEvent, webApp, withWebApp } from './webApp'
export {
  getTelegramServerState,
  getTelegramState,
  initTelegramStore,
  resetTelegramStore,
  subscribeTelegram,
  type TelegramState,
} from './store'
export { initTelegramCssVariables, writeTelegramCssVariables } from './css'
export {
  getTelegramBackDepth,
  initTelegramBackButton,
  resetTelegramBackButton,
  type TelegramBackButtonOptions,
} from './navigation'
export {
  bindTelegramFormButton,
  syncTelegramClosingConfirmation,
  telegramButton,
  type BindTelegramFormButtonOptions,
  type BottomButtonKind,
  type TelegramButtonController,
  type TelegramButtonState,
  type TelegramFormButtonBinding,
  type TelegramFormLike,
} from './buttons'
// Phase J4 — promise-based feature wrappers
export { cloudStorage, deviceStorage, secureStorage, type SecureStorageValue } from './storage'
export { biometric, type BiometricAuthResult } from './biometric'
export { location } from './location'
export { accelerometer, deviceOrientation, gyroscope, type Orientation, type Vector3 } from './sensors'
export { haptic } from './haptics'
export { popup, readClipboard, scanQr, type ScanQrOptions } from './popups'
export { downloadFile, request, setEmojiStatus, share, switchInlineQuery } from './sharing'
export { openInvoice } from './invoice'
export {
  addToHomeScreen,
  checkHomeScreenStatus,
  exitFullscreen,
  lockOrientation,
  requestFullscreen,
  unlockOrientation,
  type HomeScreenStatus,
} from './viewport'
export { TelegramUnavailableError } from './support'
export { installTelegramMock, type TelegramMockOptions } from './mock'
// Server-side (tgcloud / Node SSR) init-data validation
export {
  ExpiredInitDataError,
  InvalidInitDataError,
  tryValidateInitData,
  validateInitData,
  type ValidateInitDataOptions,
  type ValidatedInitData,
} from './validate'
// Lightweight native transport (opt-in TMA-first escape hatch)
export { closeMiniApp, sendData } from './transport'
// JS backend / tgcloud request helpers
export {
  createInitDataValidator,
  initDataFromHeaders,
  initDataFromRequest,
  TELEGRAM_INIT_DATA_HEADER,
  type InitDataValidator,
} from './server'
export * from './types'
// Auto-generated Bot API surface (types + BOT_API_VERSION). See scripts/generate-bot-api-types.mjs
export * from './botApi.generated'
