import { fromCallback, requireWebApp } from './support'

/**
 * Promise wrappers for the three Telegram storage backends.
 *
 * - `cloudStorage`  — synced across the user's devices (per bot, per user).
 * - `deviceStorage` — local to the current device, not synced.
 * - `secureStorage` — device secure enclave; values may be restorable.
 */

export const cloudStorage = {
  setItem(key: string, value: string): Promise<boolean> {
    return fromCallback<boolean>((cb) => requireWebApp('CloudStorage').CloudStorage.setItem(key, value, cb))
  },
  getItem(key: string): Promise<string> {
    return fromCallback<string>((cb) => requireWebApp('CloudStorage').CloudStorage.getItem(key, cb))
  },
  getItems(keys: string[]): Promise<Record<string, string>> {
    return fromCallback<Record<string, string>>((cb) => requireWebApp('CloudStorage').CloudStorage.getItems(keys, cb))
  },
  removeItem(key: string): Promise<boolean> {
    return fromCallback<boolean>((cb) => requireWebApp('CloudStorage').CloudStorage.removeItem(key, cb))
  },
  removeItems(keys: string[]): Promise<boolean> {
    return fromCallback<boolean>((cb) => requireWebApp('CloudStorage').CloudStorage.removeItems(keys, cb))
  },
  getKeys(): Promise<string[]> {
    return fromCallback<string[]>((cb) => requireWebApp('CloudStorage').CloudStorage.getKeys(cb))
  },
}

export const deviceStorage = {
  setItem(key: string, value: string): Promise<boolean> {
    return fromCallback<boolean>((cb) => requireWebApp('DeviceStorage').DeviceStorage.setItem(key, value, cb))
  },
  getItem(key: string): Promise<string> {
    return fromCallback<string>((cb) => requireWebApp('DeviceStorage').DeviceStorage.getItem(key, cb))
  },
  removeItem(key: string): Promise<boolean> {
    return fromCallback<boolean>((cb) => requireWebApp('DeviceStorage').DeviceStorage.removeItem(key, cb))
  },
  clear(): Promise<boolean> {
    return fromCallback<boolean>((cb) => requireWebApp('DeviceStorage').DeviceStorage.clear(cb))
  },
}

export type SecureStorageValue = { value?: string; canRestore: boolean }

export const secureStorage = {
  setItem(key: string, value: string): Promise<boolean> {
    return fromCallback<boolean>((cb) => requireWebApp('SecureStorage').SecureStorage.setItem(key, value, cb))
  },
  /** Resolves the stored value (may be absent) plus whether it can be restored. */
  getItem(key: string): Promise<SecureStorageValue> {
    return new Promise<SecureStorageValue>((resolve, reject) => {
      requireWebApp('SecureStorage').SecureStorage.getItem(key, (error, value, canRestore) => {
        if (error) {
          reject(new Error(error))
        } else {
          resolve({ value, canRestore: canRestore ?? false })
        }
      })
    })
  },
  restoreItem(key: string): Promise<string> {
    return fromCallback<string>((cb) => requireWebApp('SecureStorage').SecureStorage.restoreItem(key, cb))
  },
  removeItem(key: string): Promise<boolean> {
    return fromCallback<boolean>((cb) => requireWebApp('SecureStorage').SecureStorage.removeItem(key, cb))
  },
  clear(): Promise<boolean> {
    return fromCallback<boolean>((cb) => requireWebApp('SecureStorage').SecureStorage.clear(cb))
  },
}
