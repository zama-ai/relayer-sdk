import { defineConfig } from '@playwright/test';

export default defineConfig({
  // relative to config file
  testDir: './tests',
  use: { baseURL: 'http://localhost:5175', headless: true },
  // relative to config file
  outputDir: './_test-results-playwright',
  webServer: [
    {
      command: 'npm run serve:site',
      port: 5175,
      reuseExistingServer: false,
    },
    {
      command: 'npm run serve:cdn',
      port: 5173,
      reuseExistingServer: false,
    },
  ],
});
