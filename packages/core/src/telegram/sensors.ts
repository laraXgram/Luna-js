import {
  AccelerometerStartParams,
  DeviceOrientationStartParams,
  GyroscopeStartParams,
} from './types'
import { requireWebApp } from './support'
import { webApp } from './webApp'

/**
 * Promise wrappers for the motion sensors. `start()` / `stop()` resolve the
 * SDK's boolean success flag; `read()` returns the latest sync values. Listen
 * for continuous updates via `onTelegramEvent('accelerometerChanged', …)` etc.
 */

export type Vector3 = { x: number; y: number; z: number }
export type Orientation = { absolute: boolean; alpha: number; beta: number; gamma: number }

export const accelerometer = {
  start(params: AccelerometerStartParams = {}): Promise<boolean> {
    return new Promise((resolve) => requireWebApp('Accelerometer').Accelerometer.start(params, resolve))
  },
  stop(): Promise<boolean> {
    return new Promise((resolve) => requireWebApp('Accelerometer').Accelerometer.stop(resolve))
  },
  read(): Vector3 {
    const sensor = webApp()?.Accelerometer
    return { x: sensor?.x ?? 0, y: sensor?.y ?? 0, z: sensor?.z ?? 0 }
  },
}

export const gyroscope = {
  start(params: GyroscopeStartParams = {}): Promise<boolean> {
    return new Promise((resolve) => requireWebApp('Gyroscope').Gyroscope.start(params, resolve))
  },
  stop(): Promise<boolean> {
    return new Promise((resolve) => requireWebApp('Gyroscope').Gyroscope.stop(resolve))
  },
  read(): Vector3 {
    const sensor = webApp()?.Gyroscope
    return { x: sensor?.x ?? 0, y: sensor?.y ?? 0, z: sensor?.z ?? 0 }
  },
}

export const deviceOrientation = {
  start(params: DeviceOrientationStartParams = {}): Promise<boolean> {
    return new Promise((resolve) =>
      requireWebApp('DeviceOrientation').DeviceOrientation.start(params, resolve),
    )
  },
  stop(): Promise<boolean> {
    return new Promise((resolve) => requireWebApp('DeviceOrientation').DeviceOrientation.stop(resolve))
  },
  read(): Orientation {
    const sensor = webApp()?.DeviceOrientation
    return {
      absolute: sensor?.absolute ?? false,
      alpha: sensor?.alpha ?? 0,
      beta: sensor?.beta ?? 0,
      gamma: sensor?.gamma ?? 0,
    }
  },
}
