import { Browser, BrowserContext, chromium, webkit } from "playwright";
import logger from "../utils/logger";

export interface MobileDevice {
  name: string;
  userAgent: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  platform: 'android' | 'ios';
}

export const MOBILE_DEVICES: Record<string, MobileDevice> = {
  'iPhone 15 Pro': {
    name: 'iPhone 15 Pro',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    platform: 'ios'
  },
  'iPhone 14': {
    name: 'iPhone 14',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    platform: 'ios'
  },
  'iPhone SE': {
    name: 'iPhone SE',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    platform: 'ios'
  },
  'Samsung Galaxy S24': {
    name: 'Samsung Galaxy S24',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    viewport: { width: 360, height: 780 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    platform: 'android'
  },
  'Samsung Galaxy S23': {
    name: 'Samsung Galaxy S23',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    viewport: { width: 360, height: 780 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    platform: 'android'
  },
  'Google Pixel 8': {
    name: 'Google Pixel 8',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    platform: 'android'
  }
};

export class MobileDeviceManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async launchMobileDevice(deviceName: string): Promise<{ browser: Browser; context: BrowserContext }> {
    const device = MOBILE_DEVICES[deviceName];
    if (!device) {
      throw new Error(`Device ${deviceName} not found. Available devices: ${Object.keys(MOBILE_DEVICES).join(', ')}`);
    }

    logger.info(`Launching mobile device: ${device.name} (${device.platform})`);

    // Use webkit for iOS devices, chromium for Android
    const browserType = device.platform === 'ios' ? webkit : chromium;
    
    this.browser = await browserType.launch({
      headless: false,
      args: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-field-trial-config',
        '--disable-back-forward-cache',
        '--disable-ipc-flooding-protection',
        '--enable-features=NetworkService,NetworkServiceInProcess',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--use-mock-keychain',
        '--disable-background-networking'
      ]
    });

    this.context = await this.browser.newContext({
      userAgent: device.userAgent,
      viewport: device.viewport,
      deviceScaleFactor: device.deviceScaleFactor,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch,
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: ['geolocation', 'notifications'],
      geolocation: { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
      colorScheme: 'light'
    });

    return { browser: this.browser, context: this.context };
  }

  async cleanup(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  getAvailableDevices(): string[] {
    return Object.keys(MOBILE_DEVICES);
  }

  getDeviceInfo(deviceName: string): MobileDevice | null {
    return MOBILE_DEVICES[deviceName] || null;
  }
}
