import { requireWebApp } from './support'
import { webApp } from './webApp'

/**
 * Lightweight "TMA-first" transport helpers — the escape hatch from the
 * HTTP/Inertia visit model for the two flows Telegram provides natively:
 *
 *  - `sendData()`   — a keyboard-button Mini App returns a small payload to the
 *                     bot and closes. No server round-trip through Luna.
 *  - `close()`      — dismiss the Mini App.
 *
 * These do NOT replace Luna's router (see the roadmap's "augment" decision);
 * they let an individual view opt into the native transport when that fits
 * better than an HTTP visit (e.g. a simple picker launched from a reply keyboard).
 */

/**
 * Send a data payload back to the bot and close the Mini App. Objects/arrays are
 * JSON-encoded. Only works for Mini Apps launched from a reply-keyboard button
 * (`web_app` in a `KeyboardButton`), per Telegram's `sendData` contract, and the
 * payload is capped at 4096 bytes by Telegram.
 */
export function sendData(data: string | Record<string, unknown> | unknown[]): void {
  const payload = typeof data === 'string' ? data : JSON.stringify(data)

  requireWebApp('sendData').sendData(payload)
}

/** Close the Mini App. No-op outside Telegram. */
export function closeMiniApp(): void {
  webApp()?.close()
}
