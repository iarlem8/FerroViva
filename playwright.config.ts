import { defineConfig } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')
mkdirSync('.data', { recursive: true })

export default defineConfig({
  testDir: './tests',
  timeout: 180_000,
  expect: { timeout: 60_000 },
  workers: 1,
  use: {
    baseURL: 'http://localhost:3100',
    channel: 'chrome',
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 20_000,
    navigationTimeout: 90_000,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node node_modules/next/dist/bin/next dev --port 3100',
    url: 'http://localhost:3100/usuarios',
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      BETTER_AUTH_URL: 'http://localhost:3100',
      BETTER_AUTH_SECRET: 'ferroviva-test-only-secret-32-characters-minimum',
      LOCAL_DATABASE_NAME: `test-${Date.now()}`,
      ADMIN_EMAIL: 'iarlemlacerda@gmail.com',
      ADMIN_PASSWORD: '12345678',
    },
  },
})
