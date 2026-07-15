import { Config } from './config'
import { Router } from './router'

export { UseFormUtils } from './useFormUtils'

export { axiosAdapter } from './axiosHttpClient'
export { config } from './config'
export { getInitialPageFromDOM, getScrollableParent } from './domUtils'
export { hasFiles } from './files'
export { objectToFormData } from './formData'
export { formDataToObject } from './formObject'
export { default as createHeadManager, resolveServerHead } from './head'
export { http } from './http'
export { HttpCancelledError, HttpError, HttpNetworkError, HttpResponseError } from './httpErrors'
export { default as useInfiniteScroll } from './infiniteScroll'
/** @internal Not part of the public API. May change or be removed without notice. */
export { exposeInterceptors, interceptors } from './interceptors'
export {
  createLayoutPropsStore,
  isPropsObject,
  isPropsObjectOrCallback,
  normalizeLayouts,
  type LayoutCallbackReturn,
  type LayoutDefinition,
  type LayoutPropsStore,
} from './layout'
export { shouldIntercept, shouldNavigate } from './navigationEvents'
export { BOT_API_VERSION, type BotApiMethodName, type BotApiMethods } from './telegram/botApi.generated'
export {
  bindTelegramFormButton,
  bootstrapTelegram,
  getTelegramBackDepth,
  getTelegramServerState,
  getTelegramState,
  initData as telegramInitData,
  initDataUnsafe as telegramInitDataUnsafe,
  initTelegramBackButton,
  initTelegramCssVariables,
  initTelegramStore,
  isTelegram,
  onEvent as onTelegramEvent,
  resetTelegramBackButton,
  resetTelegramBootstrap,
  resetTelegramStore,
  subscribeTelegram,
  syncTelegramClosingConfirmation,
  telegramButton,
  webApp as telegram,
  withWebApp as withTelegram,
  writeTelegramCssVariables,
  type BindTelegramFormButtonOptions,
  type BottomButtonKind,
  type TelegramBackButtonOptions,
  type TelegramBootstrapOptions,
  type TelegramButtonController,
  type TelegramButtonState,
  type TelegramFormButtonBinding,
  type TelegramFormLike,
  type TelegramState,
} from './telegram'
export {
  accelerometer as telegramAccelerometer,
  addToHomeScreen as telegramAddToHomeScreen,
  biometric as telegramBiometric,
  checkHomeScreenStatus as telegramCheckHomeScreenStatus,
  cloudStorage as telegramCloudStorage,
  deviceOrientation as telegramDeviceOrientation,
  deviceStorage as telegramDeviceStorage,
  downloadFile as telegramDownloadFile,
  exitFullscreen as telegramExitFullscreen,
  gyroscope as telegramGyroscope,
  haptic as telegramHaptic,
  installTelegramMock,
  location as telegramLocation,
  lockOrientation as telegramLockOrientation,
  openInvoice as telegramOpenInvoice,
  popup as telegramPopup,
  readClipboard as telegramReadClipboard,
  request as telegramRequest,
  requestFullscreen as telegramRequestFullscreen,
  scanQr as telegramScanQr,
  secureStorage as telegramSecureStorage,
  setEmojiStatus as telegramSetEmojiStatus,
  share as telegramShare,
  switchInlineQuery as telegramSwitchInlineQuery,
  closeMiniApp as telegramCloseMiniApp,
  createInitDataValidator,
  ExpiredInitDataError as TelegramExpiredInitDataError,
  initDataFromHeaders as telegramInitDataFromHeaders,
  initDataFromRequest as telegramInitDataFromRequest,
  InvalidInitDataError as TelegramInvalidInitDataError,
  sendData as telegramSendData,
  TELEGRAM_INIT_DATA_HEADER,
  tryValidateInitData,
  validateInitData,
  TelegramUnavailableError,
  unlockOrientation as telegramUnlockOrientation,
  type BiometricAuthResult,
  type HomeScreenStatus,
  type Orientation as TelegramOrientation,
  type ScanQrOptions as TelegramScanQrOptions,
  type InitDataValidator as TelegramInitDataValidator,
  type TelegramMockOptions,
  type SecureStorageValue as TelegramSecureStorageValue,
  type ValidatedInitData,
  type ValidateInitDataOptions,
  type Vector3 as TelegramVector3,
} from './telegram'
export type {
  BackButton,
  BiometricManager,
  BottomButton,
  CloudStorage,
  ColorScheme,
  HapticFeedback,
  LocationData,
  LocationManager,
  SafeAreaInset,
  SettingsButton,
  TelegramSharedProps,
  ThemeParams,
  WebApp,
  WebAppChat,
  WebAppEvent,
  WebAppEventMap,
  WebAppInitData,
  WebAppUser,
} from './telegram/types'
export { isPathOrSubPath, partialReloadRequestsProp, partialReloadRequestsSomeProps } from './partialReload'
export { progress, default as setupProgress } from './progress'
export { FormComponentResetSymbol, resetFormFields } from './resetFormFields'
export { buildSSRBody } from './ssrUtils'
export * from './types'
export {
  hrefToUrl,
  isSameUrlWithoutQueryOrHash,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  resolveUrlMethodPairComponent,
  urlHasProtocol,
  urlToString,
  urlWithoutHash,
} from './url'
export { XhrHttpClient, xhrHttpClient } from './xhrHttpClient'
export { type Config, type Router }

export const router = new Router()
