import { BiometricAuthenticateParams, BiometricManager, BiometricRequestAccessParams, BiometricType } from './types'
import { requireWebApp } from './support'
import { webApp } from './webApp'

/**
 * Promise wrapper for the Telegram `BiometricManager` (fingerprint / face auth).
 * Call `biometric.init()` once before the other methods.
 */

export type BiometricAuthResult = { ok: boolean; token?: string }

export const biometric = {
  /** Raw manager, or undefined outside Telegram. */
  manager(): BiometricManager | undefined {
    return webApp()?.BiometricManager
  },
  isAvailable(): boolean {
    const manager = webApp()?.BiometricManager
    return !!manager?.isInited && manager.isBiometricAvailable
  },
  type(): BiometricType {
    return webApp()?.BiometricManager.biometricType ?? 'unknown'
  },
  init(): Promise<BiometricManager> {
    const manager = requireWebApp('BiometricManager').BiometricManager
    return new Promise((resolve) => manager.init(() => resolve(manager)))
  },
  requestAccess(params: BiometricRequestAccessParams = {}): Promise<boolean> {
    return new Promise((resolve) =>
      requireWebApp('BiometricManager').BiometricManager.requestAccess(params, resolve),
    )
  },
  authenticate(params: BiometricAuthenticateParams = {}): Promise<BiometricAuthResult> {
    return new Promise((resolve) =>
      requireWebApp('BiometricManager').BiometricManager.authenticate(params, (ok, token) =>
        resolve({ ok, token }),
      ),
    )
  },
  updateToken(token: string): Promise<boolean> {
    return new Promise((resolve) =>
      requireWebApp('BiometricManager').BiometricManager.updateBiometricToken(token, resolve),
    )
  },
  openSettings(): void {
    webApp()?.BiometricManager.openSettings()
  },
}
