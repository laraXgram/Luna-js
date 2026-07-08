import type { Method, Page, PageProps, Router } from '@lunajs/core'

declare global {
  interface Window {
    testing: {
      Luna: Router
    }
    initialPage: Page
    _luna_request_dump: {
      headers: Record<string, string>
      method: Method
      form: Record<string, unknown> | undefined
      files: MulterFile[] | object
      query: Record<string, unknown>
      url: string
      page: Page
    }
    _raw_body_response: unknown
    _luna_page_key: string | undefined
    _luna_props: PageProps
    _luna_layout_id: number | string | undefined
    _luna_site_layout_props: PageProps
    _luna_nested_layout_id: number | string | undefined
    _luna_nested_layout_props: PageProps
    _luna_page_props: PageProps
    _luna_app_layout_id: string | undefined
    _luna_content_layout_id: string | undefined
    _plugin_global_props: object
    resolverReceivedPage: Page | null
  }

  interface ImportMeta {
    readonly glob: <T>(pattern: string, options: { eager: true }) => Record<string, T>
  }
}

export type MulterFile = Express.Multer.File
