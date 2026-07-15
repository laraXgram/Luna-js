import { InvoiceStatus } from './types'
import { requireWebApp } from './support'

/**
 * Open a Telegram invoice (from a `createInvoiceLink` url) and resolve with the
 * final status once the payment sheet closes.
 */
export function openInvoice(url: string): Promise<InvoiceStatus> {
  return new Promise((resolve) => requireWebApp('openInvoice').openInvoice(url, resolve))
}
