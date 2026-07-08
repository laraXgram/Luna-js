/// <reference path="./env.d.ts" />
import {
  buildSSRBody,
  CreateLunaAppOptions,
  CreateLunaAppOptionsForCSR,
  CreateLunaAppOptionsForSSR,
  exposeInterceptors,
  getInitialPageFromDOM,
  http as httpModule,
  LunaAppSSRResponse,
  Page,
  PageProps,
  router,
  setupProgress,
  SharedPageProps,
} from '@laraxgram/luna'
import { createElement, ReactElement, StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import App, { LunaAppProps, type LunaApp } from './App'
import { config } from './index'
import { ReactComponent, ReactLunaAppConfig } from './types'

export type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: LunaApp
  props: LunaAppProps<SharedProps>
}

type ComponentResolver = (
  name: string,
  page?: Page<SharedPageProps>,
) => ReactComponent | Promise<ReactComponent> | { default: ReactComponent }

type ReactWithApp<SharedProps extends PageProps> = (
  app: ReactElement,
  options: { ssr: boolean; page: Page<SharedProps> },
) => ReactElement

type LunaAppOptionsForCSR<SharedProps extends PageProps> = CreateLunaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<HTMLElement, SharedProps>,
  void,
  ReactLunaAppConfig
> & {
  strictMode?: undefined
  withApp?: never
}

type LunaAppOptionsForSSR<SharedProps extends PageProps> = CreateLunaAppOptionsForSSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<null, SharedProps>,
  ReactElement,
  ReactLunaAppConfig
> & {
  render: typeof renderToString
  strictMode?: undefined
  withApp?: never
}

type LunaAppOptionsAuto<SharedProps extends PageProps> = Omit<
  CreateLunaAppOptions<
    ComponentResolver,
    SetupOptions<HTMLElement | null, SharedProps>,
    ReactElement | void,
    ReactLunaAppConfig
  >,
  'setup'
> & {
  page?: Page<SharedProps>
  render?: undefined
  strictMode?: boolean
} & (
    | { setup?: undefined; withApp?: ReactWithApp<SharedProps> }
    | { setup: (options: SetupOptions<HTMLElement | null, SharedProps>) => ReactElement | void; withApp?: never }
  )

type RenderToString = (element: ReactElement) => string

type RenderFunction<SharedProps extends PageProps> = (
  page: Page<SharedProps>,
  renderToString: RenderToString,
) => Promise<LunaAppSSRResponse>

export default async function createLunaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options: LunaAppOptionsForCSR<SharedProps>,
): Promise<void>
export default async function createLunaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options: LunaAppOptionsForSSR<SharedProps>,
): Promise<LunaAppSSRResponse>
export default async function createLunaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options?: LunaAppOptionsAuto<SharedProps>,
): Promise<void | RenderFunction<SharedProps>>
export default async function createLunaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  {
    id = 'app',
    resolve,
    setup,
    title,
    progress = {},
    page,
    render,
    defaults = {},
    nonce,
    http,
    layout,
    serverHead,
    strictMode = false,
    withApp,
    dev = !!import.meta.env?.DEV,
  }:
    | LunaAppOptionsForCSR<SharedProps>
    | LunaAppOptionsForSSR<SharedProps>
    | LunaAppOptionsAuto<SharedProps> = {} as LunaAppOptionsAuto<SharedProps>,
): Promise<LunaAppSSRResponse | RenderFunction<SharedProps> | void> {
  config.replace(defaults)

  if (nonce) {
    config.set('nonce', nonce)
  }

  if (http) {
    httpModule.setClient(http)
  }

  if (dev) {
    exposeInterceptors()
  }

  const isServer = typeof window === 'undefined'

  const wrapWithStrictMode = (element: ReactElement): ReactElement => {
    return strictMode ? createElement(StrictMode, null, element) : element
  }

  const resolveComponent = (name: string, page?: Page) =>
    Promise.resolve(resolve!(name, page)).then((module) => {
      return ((module as { default?: ReactComponent }).default || module) as ReactComponent
    })

  // SSR render function factory - when on server without page/render, return a render function
  // This is used by the Vite plugin's SSR transform
  if (isServer && !page && !render) {
    return async (page: Page<SharedProps>, renderToString: RenderToString) => {
      let head: string[] = []

      const initialComponent = await resolveComponent(page.component, page)

      const props: LunaAppProps<SharedProps> = {
        initialPage: page,
        initialComponent,
        resolveComponent,
        titleCallback: title,
        onHeadUpdate: (elements: string[]) => (head = elements),
        defaultLayout: layout,
        serverHead,
      }

      let reactApp: ReactElement

      if (setup) {
        reactApp = (setup as (options: SetupOptions<null, SharedProps>) => ReactElement)({
          el: null,
          App,
          props,
        })
      } else {
        reactApp = wrapWithStrictMode(createElement(App, props))

        if (withApp) {
          reactApp = withApp(reactApp, { ssr: true, page })
        }
      }

      const html = renderToString(reactApp)
      const body = buildSSRBody(id, page, html)

      return { head, body }
    }
  }

  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id)!

  let head: string[] = []

  const reactApp = await Promise.all([
    resolveComponent(initialPage.component, initialPage),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    const props: LunaAppProps<SharedProps> = {
      initialPage,
      initialComponent,
      resolveComponent,
      titleCallback: title,
      onHeadUpdate: isServer ? (elements: string[]) => (head = elements) : undefined,
      defaultLayout: layout,
      serverHead,
    }

    if (isServer) {
      return (setup as (options: SetupOptions<null, SharedProps>) => ReactElement)({
        el: null,
        App,
        props,
      })
    }

    const el = document.getElementById(id)!

    if (setup) {
      return (setup as (options: SetupOptions<HTMLElement, SharedProps>) => void)({
        el,
        App,
        props,
      })
    }

    let appElement = wrapWithStrictMode(createElement(App, props))

    if (withApp) {
      appElement = withApp(appElement, { ssr: false, page: initialPage })
    }

    if (el.hasAttribute('data-server-rendered')) {
      hydrateRoot(el, appElement)
    } else {
      createRoot(el).render(appElement)
    }
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer && render && reactApp) {
    const html = render(reactApp)
    const body = buildSSRBody(id, initialPage, html)

    return { head, body }
  }
}
