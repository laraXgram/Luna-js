import { WebApp, WebAppEvent, WebAppEventMap } from './types'
import { onEvent, webApp } from './webApp'

/**
 * Shared plumbing for the promise-based feature wrappers. The raw Telegram SDK
 * is entirely callback / event driven; these helpers turn it into promises with
 * consistent error handling.
 */

export class TelegramUnavailableError extends Error {
  constructor(feature?: string) {
    super(
      feature
        ? `Telegram.${feature} is unavailable (not running inside Telegram).`
        : 'Telegram WebApp is unavailable (not running inside Telegram).',
    )
    this.name = 'TelegramUnavailableError'
  }
}

/** Get the WebApp instance or throw a typed error. */
export function requireWebApp(feature?: string): WebApp {
  const app = webApp()

  if (!app) {
    throw new TelegramUnavailableError(feature)
  }

  return app
}

/** Reject a promise when not inside Telegram, otherwise run `fn(app)`. */
export function withApp<T>(feature: string, fn: (app: WebApp) => Promise<T> | T): Promise<T> {
  const app = webApp()

  if (!app) {
    return Promise.reject(new TelegramUnavailableError(feature))
  }

  return Promise.resolve().then(() => fn(app))
}

/** Promisify a Telegram `(error, result)` callback. */
export function fromCallback<T>(run: (cb: (error: string | null, result?: T) => void) => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    run((error, result) => {
      if (error) {
        reject(new Error(error))
      } else {
        resolve(result as T)
      }
    })
  })
}

/** Promisify a Telegram single-argument success callback, e.g. `(granted) => void`. */
export function fromValue<T>(run: (cb: (value: T) => void) => void): Promise<T> {
  return new Promise<T>((resolve) => run(resolve))
}

type EventPayload<E extends WebAppEvent> = WebAppEventMap[E] extends [infer P, ...unknown[]] ? P : void

function payloadToError(payload: unknown): Error {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    return new Error(String((payload as { error: unknown }).error))
  }

  return new Error('Telegram operation failed.')
}

/**
 * Trigger an SDK action and resolve when `success` fires (with its payload),
 * or reject when the optional `failure` event fires. Listeners are one-shot.
 */
export function awaitEvent<S extends WebAppEvent>(
  success: S,
  options: { failure?: WebAppEvent; trigger?: () => void } = {},
): Promise<EventPayload<S>> {
  const app = webApp()

  return new Promise<EventPayload<S>>((resolve, reject) => {
    if (!app) {
      reject(new TelegramUnavailableError())
      return
    }

    let offSuccess: () => void = () => {}
    let offFailure: () => void = () => {}

    const cleanup = () => {
      offSuccess()
      offFailure()
    }

    offSuccess = onEvent(success, (payload?: unknown) => {
      cleanup()
      resolve(payload as EventPayload<S>)
    })

    if (options.failure) {
      offFailure = onEvent(options.failure, (payload?: unknown) => {
        cleanup()
        reject(payloadToError(payload))
      })
    }

    try {
      options.trigger?.()
    } catch (error) {
      cleanup()
      reject(error)
    }
  })
}
