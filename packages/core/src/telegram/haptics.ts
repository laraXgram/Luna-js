import { HapticImpactStyle, HapticNotificationType } from './types'
import { webApp } from './webApp'

/**
 * Thin, SSR-safe wrapper over `HapticFeedback`. Already synchronous in the SDK;
 * these just no-op outside Telegram so call sites don't need guards.
 */
export const haptic = {
  impact(style: HapticImpactStyle): void {
    webApp()?.HapticFeedback.impactOccurred(style)
  },
  notification(type: HapticNotificationType): void {
    webApp()?.HapticFeedback.notificationOccurred(type)
  },
  selection(): void {
    webApp()?.HapticFeedback.selectionChanged()
  },
}
