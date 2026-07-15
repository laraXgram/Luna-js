import { config as coreConfig } from '@laraxgram/luna'
import type { VueLunaAppConfig } from './types'

export { http, progress, router } from '@laraxgram/luna'
export { default as App, usePage } from './app'
export { default as createLunaApp } from './createLunaApp'
export { default as Deferred } from './deferred'
export { createForm, default as Form, useFormContext } from './form'
export { default as Head } from './head'
export { default as InfiniteScroll } from './infiniteScroll'
export { resetLayoutProps, setLayoutProps } from './layoutProps'
export { LunaLinkProps, default as Link } from './link'
export { type LayoutCallback, type VueLunaAppConfig, type VuePageHandlerArgs } from './types'
export { LunaForm, LunaFormProps, LunaPrecognitiveForm, default as useForm } from './useForm'
export { default as useHttp } from './useHttp'
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
export { default as WhenVisible } from './whenVisible'

export const config = coreConfig.extend<VueLunaAppConfig>({})
