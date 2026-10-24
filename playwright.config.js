import { defineConfig } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4188/tender-review-brief/'

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.browser.js',
  forbidOnly: true,
  workers: 1,
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4188 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30000,
  },
})
