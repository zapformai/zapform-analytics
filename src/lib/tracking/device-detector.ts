import { UAParser } from 'ua-parser-js'

export interface DeviceInfo {
  browser?: string
  browserVersion?: string
  os?: string
  osVersion?: string
  deviceType?: string
  screenWidth?: number
  screenHeight?: number
}

export function detectDevice(userAgent: string): DeviceInfo {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  return {
    browser: result.browser.name,
    browserVersion: result.browser.version,
    os: result.os.name,
    osVersion: result.os.version,
    deviceType: result.device.type || 'desktop',
  }
}

export function getClientDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {}
  }

  const parser = new UAParser(navigator.userAgent)
  const result = parser.getResult()

  return {
    browser: result.browser.name,
    browserVersion: result.browser.version,
    os: result.os.name,
    osVersion: result.os.version,
    deviceType: result.device.type || 'desktop',
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  }
}
