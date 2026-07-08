import {
  createHeadManager,
  type LayoutCallbackReturn,
  Page,
  PageHandler,
  PageProps,
  router,
  SharedPageProps,
} from '@lunajs/core'
import { Component, DefineComponent, VNode } from 'vue'
import useForm from './useForm'

export type VuePageHandlerArgs = Parameters<PageHandler<DefineComponent>>[0]
export type VueLunaAppConfig = {}

export type LayoutCallback = (props: SharedPageProps) => LayoutCallbackReturn<Component>
export type LayoutRenderFunction = (h: (component: Component, children: Component[]) => VNode, page: Component) => VNode

declare module '@lunajs/core' {
  export interface Router {
    form: typeof useForm
  }
}

declare module 'vue' {
  export interface ComponentCustomProperties {
    $luna: typeof router
    $page: Page<PageProps & SharedPageProps>
    $headManager: ReturnType<typeof createHeadManager>
  }

  export interface ComponentCustomOptions {
    layout?:
      | LayoutCallbackReturn<DefineComponent<any, any, any>>
      | Component[]
      | ((props: any) => any)
      | LayoutRenderFunction
    remember?:
      | string
      | string[]
      | {
          data: string | string[]
          key?: string | (() => string)
        }
  }
}
