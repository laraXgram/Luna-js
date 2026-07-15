import { ValidatedInitData, ValidateInitDataOptions, tryValidateInitData, validateInitData } from './validate'

/**
 * Helpers for JS backends (Telegram Serverless / tgcloud, Node, Deno, Bun) that
 * receive Mini App requests and must validate the init data. Pairs with
 * `validateInitData`; the goal is a one-liner guard per request.
 */

/** The header Luna's client sends the signed init data in. */
export const TELEGRAM_INIT_DATA_HEADER = 'X-Telegram-Init-Data'

type HeaderBag = Headers | Record<string, string | string[] | undefined>

function readHeader(headers: HeaderBag, name: string): string | null {
  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name)
  }

  const bag = headers as Record<string, string | string[] | undefined>
  const lower = name.toLowerCase()
  const key = Object.keys(bag).find((k) => k.toLowerCase() === lower)
  const value = key ? bag[key] : undefined

  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null)
}

/** Extract the raw init-data string from a header bag (`X-Telegram-Init-Data`). */
export function initDataFromHeaders(headers: HeaderBag): string | null {
  return readHeader(headers, TELEGRAM_INIT_DATA_HEADER)
}

/**
 * Extract the raw init-data string from a Fetch-style `Request`: the header
 * first (Mini App XHR visits), then the `tgWebAppData` / `_auth` query param
 * (initial document load).
 */
export function initDataFromRequest(request: { headers: HeaderBag; url?: string }): string | null {
  const fromHeader = initDataFromHeaders(request.headers)

  if (fromHeader) {
    return fromHeader
  }

  if (request.url) {
    try {
      const params = new URL(request.url).searchParams

      for (const key of ['tgWebAppData', '_auth', 'initData']) {
        const value = params.get(key)

        if (value) {
          return value
        }
      }
    } catch {
      // Non-absolute URL; ignore.
    }
  }

  return null
}

export interface InitDataValidator {
  /** Validate a raw init-data string; rejects on failure. */
  validate(initData: string): Promise<ValidatedInitData>
  /** Validate a raw init-data string; resolves null on failure. */
  tryValidate(initData: string): Promise<ValidatedInitData | null>
  /** Validate the init data carried by a Fetch-style request; rejects if absent or invalid. */
  fromRequest(request: { headers: HeaderBag; url?: string }): Promise<ValidatedInitData>
}

/**
 * Bind validation options once (bot token, scheme, ttl) and get a reusable
 * validator — the recommended entry point for a tgcloud handler.
 *
 * @example
 * const tg = createInitDataValidator({ botToken: env.BOT_TOKEN })
 * const user = (await tg.fromRequest(request)).user
 */
export function createInitDataValidator(options: ValidateInitDataOptions): InitDataValidator {
  return {
    validate: (initData) => validateInitData(initData, options),
    tryValidate: (initData) => tryValidateInitData(initData, options),
    async fromRequest(request) {
      const raw = initDataFromRequest(request)

      if (!raw) {
        return validateInitData('', options) // throws InvalidInitDataError (empty)
      }

      return validateInitData(raw, options)
    },
  }
}
