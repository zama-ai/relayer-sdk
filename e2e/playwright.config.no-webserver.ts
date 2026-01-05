import { defineConfig } from '@playwright/test';

export default defineConfig({
  // relative to config file
  testDir: './tests',
  use: { baseURL: 'http://localhost:5175', headless: true },
  // relative to config file
  outputDir: './_test-results-playwright-no-webserver',
});
