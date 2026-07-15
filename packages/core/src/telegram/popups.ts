import { PopupParams, ScanQrPopupParams } from './types'
import { requireWebApp } from './support'
import { onEvent } from './webApp'

/**
 * Promise wrappers for the native dialogs: popup, alert, confirm, QR scanner and
 * clipboard read.
 */
export const popup = {
  /** Resolves the tapped button id, or `null` if dismissed. */
  show(params: PopupParams): Promise<string | null> {
    return new Promise((resolve) => requireWebApp('showPopup').showPopup(params, resolve))
  },
  alert(message: string): Promise<void> {
    return new Promise((resolve) => requireWebApp('showAlert').showAlert(message, resolve))
  },
  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => requireWebApp('showConfirm').showConfirm(message, resolve))
  },
}

export type ScanQrOptions = ScanQrPopupParams & {
  /**
   * Called for each decoded QR text. Return `true` to accept it (closes the
   * scanner and resolves) or `false`/nothing to keep scanning. Defaults to
   * accepting the first result.
   */
  accept?: (data: string) => boolean
}

/**
 * Open the QR scanner. Resolves with the accepted text, or `null` if the user
 * closes the scanner without a match.
 */
export function scanQr(options: ScanQrOptions = {}): Promise<string | null> {
  const app = requireWebApp('showScanQrPopup')
  const { accept, ...params } = options

  return new Promise((resolve) => {
    let settled = false
    let offClosed: () => void = () => {}

    const finish = (result: string | null) => {
      if (settled) {
        return
      }

      settled = true
      offClosed()
      resolve(result)
    }

    offClosed = onEvent('scanQrPopupClosed', () => finish(null))

    app.showScanQrPopup(params, (text) => {
      const ok = accept ? accept(text) : true

      if (ok) {
        app.closeScanQrPopup()
        finish(text)
        return true
      }

      return false
    })
  })
}

/** Read the device clipboard. Resolves `null` when access is denied/empty. */
export function readClipboard(): Promise<string | null> {
  return new Promise((resolve) => requireWebApp('readTextFromClipboard').readTextFromClipboard(resolve))
}
