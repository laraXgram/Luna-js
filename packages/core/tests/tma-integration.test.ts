import { describe, expect, it } from 'vitest'
import { createInitDataValidator } from '../src/telegram/server'
import type { TelegramSharedProps } from '../src/telegram/types'
import { installTelegramMock } from '../src/telegram/mock'
import { initDataUnsafe, isTelegram } from '../src/telegram/webApp'

/**
 * End-to-end contract test across the layers:
 *   client init data  →  server validation  →  shared `telegram` prop  →  client
 *
 * Verifies the shape the PHP `SharesTelegramContext` trait produces is exactly
 * what the JS `useTelegramUser()` helpers read (`TelegramSharedProps`), using the
 * JS validator (`server.ts`) to stand in for the PHP middleware.
 */

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
  return [...Object.entries(fields).map(([k, v]) => `${k}=${encodeURIComponent(v)}`), `hash=${hash}`].join('&')
}

const BOT_TOKEN = '7123456789:AA-integration'
const now = Math.floor(Date.now() / 1000)

describe('TMA cross-layer contract', () => {
  it('server-validated user maps onto the shared telegram prop the client reads', async () => {
    // 1. Client sends signed init data (built here).
    const raw = await sign(BOT_TOKEN, {
      auth_date: String(now),
      start_param: 'ref_42',
      user: '{"id":501,"first_name":"Lin","username":"lin","is_premium":true}',
    })

    // 2. Backend validates (mirrors the PHP `telegram` middleware).
    const tg = createInitDataValidator({ botToken: BOT_TOKEN })
    const validated = await tg.validate(raw)

    // 3. Backend shares the `telegram` prop (mirrors SharesTelegramContext).
    const shared: TelegramSharedProps = {
      user: validated.user,
      chat: validated.chat,
      receiver: validated.receiver,
      startParam: validated.start_param ?? null,
      chatType: validated.chat_type ?? null,
      chatInstance: validated.chat_instance ?? null,
    }

    // 4. Client reads it (what useTelegramUser returns).
    expect(shared.user?.id).toBe(501)
    expect(shared.user?.username).toBe('lin')
    expect(shared.user?.is_premium).toBe(true)
    expect(shared.startParam).toBe('ref_42')
  })

  it('the mock SDK exposes the same initDataUnsafe surface for local dev', () => {
    ;(globalThis as { window?: unknown }).window = {}
    installTelegramMock({
      initDataUnsafe: {
        auth_date: now,
        hash: '',
        user: { id: 501, first_name: 'Lin' },
      },
    })

    expect(isTelegram()).toBe(true)
    expect(initDataUnsafe()?.user?.id).toBe(501)

    delete (globalThis as { window?: unknown }).window
  })
})
