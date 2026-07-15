import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ExpiredInitDataError,
  InvalidInitDataError,
  tryValidateInitData,
  validateInitData,
} from '../src/telegram/validate'
import { closeMiniApp, sendData } from '../src/telegram/transport'

const enc = new TextEncoder()

async function hmac(keyBytes: Uint8Array, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(message)))
}

async function sign(botToken: string, fields: Record<string, string>): Promise<string> {
  const dcs = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join('\n')

  const secret = await hmac(enc.encode('WebAppData'), botToken)
  const hashBytes = await hmac(secret, dcs)
  const hash = [...hashBytes].map((b) => b.toString(16).padStart(2, '0')).join('')

  const query = Object.entries(fields).map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
  query.push(`hash=${hash}`)

  return query.join('&')
}

const BOT_TOKEN = '7123456789:AA-test-token'
const now = Math.floor(Date.now() / 1000)

const baseFields = {
  auth_date: String(now),
  query_id: 'AAHtest',
  user: '{"id":42,"first_name":"Ada","username":"ada"}',
}

afterEach(() => {
  delete (globalThis as any).window
})

describe('validateInitData (tgcloud / JS backend)', () => {
  it('accepts genuine HMAC-signed data and parses fields', async () => {
    const raw = await sign(BOT_TOKEN, baseFields)
    const result = await validateInitData(raw, { botToken: BOT_TOKEN })

    expect(result.user?.id).toBe(42)
    expect(result.user?.username).toBe('ada')
    expect(result.query_id).toBe('AAHtest')
    expect(result.auth_date).toBe(now)
  })

  it('rejects tampered data', async () => {
    const raw = await sign(BOT_TOKEN, baseFields)
    const broken = raw.replace(
      encodeURIComponent(baseFields.user),
      encodeURIComponent('{"id":99,"first_name":"Mallory"}'),
    )
    await expect(validateInitData(broken, { botToken: BOT_TOKEN })).rejects.toBeInstanceOf(InvalidInitDataError)
  })

  it('rejects data signed with a different bot token', async () => {
    const raw = await sign('9999999999:OTHER', baseFields)
    await expect(validateInitData(raw, { botToken: BOT_TOKEN })).rejects.toBeInstanceOf(InvalidInitDataError)
  })

  it('rejects data missing a hash', async () => {
    await expect(validateInitData('auth_date=' + now + '&user=%7B%7D', { botToken: BOT_TOKEN })).rejects.toBeInstanceOf(
      InvalidInitDataError,
    )
  })

  it('rejects expired data under a short TTL', async () => {
    const stale = await sign(BOT_TOKEN, { ...baseFields, auth_date: String(now - 100000) })
    await expect(validateInitData(stale, { botToken: BOT_TOKEN, ttl: 3600 })).rejects.toBeInstanceOf(
      ExpiredInitDataError,
    )
  })

  it('requires a bot token for the hmac scheme', async () => {
    const raw = await sign(BOT_TOKEN, baseFields)
    await expect(validateInitData(raw, {})).rejects.toBeInstanceOf(InvalidInitDataError)
  })

  it('tryValidateInitData returns null on failure, data on success', async () => {
    const raw = await sign(BOT_TOKEN, baseFields)
    expect(await tryValidateInitData('bad=1', { botToken: BOT_TOKEN })).toBeNull()
    expect(await tryValidateInitData(raw, { botToken: BOT_TOKEN })).not.toBeNull()
  })
})

describe('native transport helpers', () => {
  it('sendData JSON-encodes objects and forwards to the SDK', () => {
    const send = vi.fn()
    ;(globalThis as any).window = { Telegram: { WebApp: { sendData: send, close: vi.fn() } } }

    sendData({ choice: 7 })
    expect(send).toHaveBeenCalledWith('{"choice":7}')

    sendData('raw-string')
    expect(send).toHaveBeenCalledWith('raw-string')
  })

  it('closeMiniApp is a no-op outside Telegram', () => {
    delete (globalThis as any).window
    expect(() => closeMiniApp()).not.toThrow()
  })
})
