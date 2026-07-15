import { config as coreConfig } from '@laraxgram/luna'
import type { ReactLunaAppConfig } from './types'

export { http, progress, router } from '@laraxgram/luna'
export { default as App } from './App'
export { default as createLunaApp } from './createLunaApp'
export { default as Deferred } from './Deferred'
export { default as Form, useFormContext } from './Form'
export { default as Head } from './Head'
export { default as InfiniteScroll } from './InfiniteScroll'
export { resetLayoutProps, setLayoutProps } from './layoutProps'
export { LunaLinkProps, default as Link } from './Link'
export { LayoutCallback, ReactComponent as ResolvedComponent } from './types'
export {
  LunaForm,
  LunaFormProps,
  LunaPrecognitiveFormProps,
  SetDataAction,
  SetDataByKeyValuePair,
  SetDataByMethod,
  SetDataByObject,
  default as useForm,
} from './useForm'
export { default as useHttp } from './useHttp'
export { default as usePage } from './usePage'
export { default as usePoll } from './usePoll'
export { default as usePrefetch } from './usePrefetch'
export { default as useRemember } from './useRemember'
export {
  useTelegram,
  useTelegramBackButton,
  useTelegramClosingConfirmation,
  useTelegramFormButton,
  useTelegramSharedContext,
  useTelegramTheme,
  useTelegramUser,
  useTelegramViewport,
} from './telegram'
export { default as WhenVisible } from './WhenVisible'

export const config = coreConfig.extend<ReactLunaAppConfig>()
