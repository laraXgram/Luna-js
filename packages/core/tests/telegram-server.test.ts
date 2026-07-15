import { describe, expect, it } from 'vitest'
import {
  createInitDataValidator,
  initDataFromHeaders,
  initDataFromRequest,
  TELEGRAM_INIT_DATA_HEADER,
} from '../src/telegram/server'
import { InvalidInitDataError } from '../src/telegram/validate'

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
  const hash = [...(await hmac(secret, dcs))].map((b) => b.toString(16).padStart(2, '0')).join('')
  const query = Object.entries(fields).map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
  query.push(`hash=${hash}`)
  return query.join('&')
}

const BOT_TOKEN = '7123456789:AA-server-token'
const now = Math.floor(Date.now() / 1000)
const fields = { auth_date: String(now), user: '{"id":7,"first_name":"Grace"}' }

describe('init-data extraction', () => {
  it('reads the header from a Headers object', () => {
    const headers = new Headers({ [TELEGRAM_INIT_DATA_HEADER]: 'abc=1' })
    expect(initDataFromHeaders(headers)).toBe('abc=1')
  })

  it('reads the header from a plain object case-insensitively', () => {
    expect(initDataFromHeaders({ 'x-telegram-init-data': 'abc=1' })).toBe('abc=1')
  })

  it('falls back to the tgWebAppData query param', () => {
    const req = { headers: {}, url: 'https://app.example/mini?tgWebAppData=xyz%3D1' }
    expect(initDataFromRequest(req)).toBe('xyz=1')
  })

  it('returns null when nothing is present', () => {
    expect(initDataFromRequest({ headers: {}, url: 'https://app.example/mini' })).toBeNull()
  })
})

describe('createInitDataValidator (tgcloud handler)', () => {
  it('validates init data carried in a request header', async () => {
    const raw = await sign(BOT_TOKEN, fields)
    const tg = createInitDataValidator({ botToken: BOT_TOKEN })
    const request = { headers: new Headers({ [TELEGRAM_INIT_DATA_HEADER]: raw }) }

    const data = await tg.fromRequest(request)
    expect(data.user?.id).toBe(7)
    expect(data.user?.first_name).toBe('Grace')
  })

  it('rejects a request with no init data', async () => {
    const tg = createInitDataValidator({ botToken: BOT_TOKEN })
    await expect(tg.fromRequest({ headers: {} })).rejects.toBeInstanceOf(InvalidInitDataError)
  })

  it('tryValidate resolves null on tampered data', async () => {
    const raw = await sign(BOT_TOKEN, fields)
    const tg = createInitDataValidator({ botToken: BOT_TOKEN })
    const tampered = raw.replace(encodeURIComponent(fields.user), encodeURIComponent('{"id":999}'))
    expect(await tg.tryValidate(tampered)).toBeNull()
    expect(await tg.tryValidate(raw)).not.toBeNull()
  })
})
