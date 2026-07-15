import { awaitEvent, fromValue, requireWebApp } from './support'
import { webApp } from './webApp'

/**
 * Promise wrappers for viewport-level controls: fullscreen, orientation lock and
 * the add-to-home-screen flow. The fullscreen / home-screen actions resolve or
 * reject based on the SDK's success / failure events.
 */

/** Enter fullscreen. Resolves on `fullscreenChanged`, rejects on `fullscreenFailed`. */
export function requestFullscreen(): Promise<void> {
  return awaitEvent('fullscreenChanged', {
    failure: 'fullscreenFailed',
    trigger: () => requireWebApp('requestFullscreen').requestFullscreen(),
  })
}

/** Exit fullscreen. Resolves on the next `fullscreenChanged`. */
export function exitFullscreen(): Promise<void> {
  return awaitEvent('fullscreenChanged', {
    trigger: () => requireWebApp('exitFullscreen').exitFullscreen(),
  })
}

export function lockOrientation(): void {
  webApp()?.lockOrientation()
}

export function unlockOrientation(): void {
  webApp()?.unlockOrientation()
}

/** Prompt to add the Mini App to the home screen. Resolves on `homeScreenAdded`. */
export function addToHomeScreen(): Promise<void> {
  return awaitEvent('homeScreenAdded', {
    trigger: () => requireWebApp('addToHomeScreen').addToHomeScreen(),
  })
}

export type HomeScreenStatus = 'unsupported' | 'unknown' | 'added' | 'missed'

/** Check whether the Mini App is on the home screen. */
export function checkHomeScreenStatus(): Promise<HomeScreenStatus> {
  return fromValue<HomeScreenStatus>((cb) =>
    requireWebApp('checkHomeScreenStatus').checkHomeScreenStatus((status) => cb(status as HomeScreenStatus)),
  )
}
