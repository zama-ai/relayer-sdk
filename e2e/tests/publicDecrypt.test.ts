import { Page, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

function getBaseUrl(): string {
  const baseURL = test.info().config.projects[0].use.baseURL;
  if (!baseURL) {
    const configFile = test.info().config.configFile ?? 'playwright config.';
    throw new Error(`Missing baseURL in ${configFile}`);
  }
  return baseURL;
}

function getPageUrl(h: string): string {
  const baseURL = getBaseUrl();
  const json = readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '../servers/site/pages.json',
    ),
    'utf8',
  );
  const pages = JSON.parse(json);
  return new URL(pages[h], baseURL).href;
}

async function runTest(
  host: string,
  page: Page,
  modulePath: string,
  funcName: string,
) {
  const mod = await import(modulePath);

  // The test is CPU intensive, setup a large timeout 20 minutes
  // On a Macbook Pro M4: the tests takes approx 59s
  test.setTimeout(20 * 60_000);

  // This is required to display console.log messages
  page.on('console', (msg) => {
    console.log(msg);
  });

  await page.goto(getPageUrl(host));
  await page.evaluate(mod[funcName]);
}

test.describe('UMD tests', () => {
  test('Call instance.publicDecrypt() using localhost', async ({ page }) => {
    await runTest('localhost', page, './publicDecrypt.js', 'testPublicDecrypt');
  });

  test('Call instance.publicDecrypt() using test.cdn.zama.ai', async ({
    page,
  }) => {
    await runTest(
      'test.cdn.zama.ai',
      page,
      './publicDecrypt.js',
      'testPublicDecrypt',
    );
  });
});
