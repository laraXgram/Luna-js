import { WebAppChat, WebAppInitData, WebAppUser } from './types'

/**
 * Server-side validation of Telegram Web App init data, mirroring the PHP
 * `InitDataValidator`. Intended for **JS backends** — most importantly Telegram
 * Serverless (tgcloud) V8 isolates, where the bot token is available in-sandbox
 * — and Node/Deno/Bun SSR entry points.
 *
 * NEVER call this in browser/client code with a real bot token: the token is a
 * server secret. The PHP path (`Middleware/AuthenticateTelegram`) remains the
 * canonical validator for the LaraGram backend; this exists for JS backends.
 *
 * Uses the Web Crypto API (`globalThis.crypto.subtle`), available in tgcloud,
 * Node 16+, Deno and modern browsers.
 *
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * @see https://core.telegram.org/bots/serverless
 */

const HMAC_KEY = 'WebAppData'

export class InvalidInitDataError extends Error {
  constructor(message = 'Telegram init data is invalid.') {
    super(message)
    this.name = 'InvalidInitDataError'
  }
}

export class ExpiredInitDataError extends Error {
  constructor(message = 'Telegram init data has expired.') {
    super(message)
    this.name = 'ExpiredInitDataError'
  }
}

export type ValidateInitDataOptions = {
  /** Bot token, required for the (default) `hmac` scheme. */
  botToken?: string
  /** Hex-encoded Ed25519 public key, required for the `signature` scheme. */
  publicKey?: string
  /** Validation scheme. Default: `'hmac'`. */
  scheme?: 'hmac' | 'signature' | 'both'
  /** Max age in seconds before init data is considered stale. `0` disables. Default: 86400. */
  ttl?: number
  /** Override "now" (seconds) — for testing. */
  now?: number
}

/** The validated, parsed init data. Every field here is trustworthy. */
export type ValidatedInitData = WebAppInitData & {
  user?: WebAppUser
  chat?: WebAppChat
  receiver?: WebAppUser
}

function subtle(): SubtleCrypto {
  const c = (globalThis as { crypto?: Crypto }).crypto

  if (!c?.subtle) {
    throw new InvalidInitDataError('Web Crypto API is unavailable in this runtime.')
  }

  return c.subtle
}

function utf8(value: string): Uint8Array {
  return new TextEncoder().encode(value)
}

function toHex(bytes: Uint8Array): string {
  let hex = ''

  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0')
  }

  return hex
}

/** Constant-time comparison of two equal-length hex strings. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let diff = 0

  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return diff === 0
}

async function hmacSha256(keyBytes: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const key = await subtle().importKey('raw', keyBytes as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const signature = await subtle().sign('HMAC', key, message as BufferSource)

  return new Uint8Array(signature)
}

/** Parse a raw init-data query string into byte-exact decoded fields. */
function parseFields(initData: string): Record<string, string> {
  const fields: Record<string, string> = {}

  for (const chunk of initData.split('&')) {
    if (chunk === '') {
      continue
    }

    const eq = chunk.indexOf('=')

    if (eq === -1) {
      continue
    }

    fields[decodeURIComponent(chunk.slice(0, eq))] = decodeURIComponent(chunk.slice(eq + 1))
  }

  return fields
}

/** Build the data-check-string: sorted `key=value` pairs excluding hash/signature. */
function dataCheckString(fields: Record<string, string>): string {
  return Object.keys(fields)
    .filter((key) => key !== 'hash' && key !== 'signature')
    .sort()
    .map((key) => `${key}=${fields[key]}`)
    .join('\n')
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new InvalidInitDataError('Malformed public key.')
  }

  const bytes = new Uint8Array(hex.length / 2)

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }

  return bytes
}

async function verifyHmac(fields: Record<string, string>, botToken: string): Promise<void> {
  const secretKey = await hmacSha256(utf8(HMAC_KEY), utf8(botToken))
  const expected = toHex(await hmacSha256(secretKey, utf8(dataCheckString(fields))))

  if (!timingSafeEqual(expected, fields.hash ?? '')) {
    throw new InvalidInitDataError('Telegram init data hash mismatch.')
  }
}

async function verifySignature(fields: Record<string, string>, botToken: string, publicKey: string): Promise<void> {
  const signature = fields.signature

  if (!signature) {
    throw new InvalidInitDataError('Telegram init data is missing its signature.')
  }

  const botId = botToken.split(':')[0]

  if (!botId) {
    throw new InvalidInitDataError('A bot token is required to derive the bot id for signature validation.')
  }

  const message = utf8(`${botId}:${HMAC_KEY}\n${dataCheckString(fields)}`)

  let ok = false

  try {
    const key = await subtle().importKey('raw', hexToBytes(publicKey) as BufferSource, { name: 'Ed25519' }, false, [
      'verify',
    ])
    ok = await subtle().verify('Ed25519', key, base64UrlToBytes(signature) as BufferSource, message as BufferSource)
  } catch {
    throw new InvalidInitDataError('Ed25519 verification is unsupported in this runtime.')
  }

  if (!ok) {
    throw new InvalidInitDataError('Telegram init data signature mismatch.')
  }
}

function ensureFresh(fields: Record<string, string>, ttl: number, now: number): void {
  if (ttl <= 0) {
    return
  }

  const authDate = Number(fields.auth_date ?? 0)

  if (!authDate || now - authDate > ttl) {
    throw new ExpiredInitDataError()
  }
}

function parseJsonField<T>(value: string | undefined): T | undefined {
  if (!value) {
    return undefined
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

function buildResult(fields: Record<string, string>): ValidatedInitData {
  return {
    query_id: fields.query_id,
    user: parseJsonField<WebAppUser>(fields.user),
    receiver: parseJsonField<WebAppUser>(fields.receiver),
    chat: parseJsonField<WebAppChat>(fields.chat),
    chat_type: fields.chat_type as WebAppInitData['chat_type'],
    chat_instance: fields.chat_instance,
    start_param: fields.start_param,
    can_send_after: fields.can_send_after ? Number(fields.can_send_after) : undefined,
    auth_date: Number(fields.auth_date ?? 0),
    signature: fields.signature,
    hash: fields.hash ?? '',
  }
}

/**
 * Validate a raw init-data string and resolve the trusted, parsed payload.
 * Rejects with {@link InvalidInitDataError} / {@link ExpiredInitDataError} on any
 * tampered, malformed, unsigned or stale data (fails closed).
 */
export async function validateInitData(
  initData: string,
  options: ValidateInitDataOptions,
): Promise<ValidatedInitData> {
  const { botToken, publicKey, scheme = 'hmac', ttl = 86400, now = Math.floor(Date.now() / 1000) } = options

  const fields = parseFields(initData)

  if (Object.keys(fields).length === 0) {
    throw new InvalidInitDataError('Telegram init data is empty or malformed.')
  }

  if (!fields.hash) {
    throw new InvalidInitDataError('Telegram init data is missing its hash.')
  }

  if (scheme === 'hmac' || scheme === 'both') {
    if (!botToken) {
      throw new InvalidInitDataError('A bot token is required for HMAC validation.')
    }

    await verifyHmac(fields, botToken)
  }

  if (scheme === 'signature' || scheme === 'both') {
    if (!publicKey) {
      throw new InvalidInitDataError('A public key is required for signature validation.')
    }

    await verifySignature(fields, botToken ?? '', publicKey)
  }

  ensureFresh(fields, ttl, now)

  return buildResult(fields)
}

/** Validate without throwing; resolves `null` on any failure. */
export async function tryValidateInitData(
  initData: string,
  options: ValidateInitDataOptions,
): Promise<ValidatedInitData | null> {
  try {
    return await validateInitData(initData, options)
  } catch (error) {
    if (error instanceof InvalidInitDataError || error instanceof ExpiredInitDataError) {
      return null
    }

    throw error
  }
}
