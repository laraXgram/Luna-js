import { LocationData, LocationManager } from './types'
import { requireWebApp } from './support'
import { webApp } from './webApp'

/**
 * Promise wrapper for the Telegram `LocationManager`. Call `location.init()`
 * once, then `getLocation()`. A `null` result means access was denied.
 */
export const location = {
  manager(): LocationManager | undefined {
    return webApp()?.LocationManager
  },
  isAvailable(): boolean {
    const manager = webApp()?.LocationManager
    return !!manager?.isInited && manager.isLocationAvailable
  },
  init(): Promise<void> {
    return new Promise((resolve) => requireWebApp('LocationManager').LocationManager.init(() => resolve()))
  },
  getLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => requireWebApp('LocationManager').LocationManager.getLocation(resolve))
  },
  openSettings(): void {
    webApp()?.LocationManager.openSettings()
  },
}
