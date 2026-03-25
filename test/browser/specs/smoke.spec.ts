import { test, expect } from "@playwright/test";

test("createFhevmClient initializes in browser", async ({ page }) => {
  await page.goto("/test/browser/index.html");

  const result = page.locator("#result");
  await result.waitFor({ timeout: 300_000 });

  const status = await result.getAttribute("data-status");
  if (status !== "pass") {
    const logs = await page.locator("#log").textContent();
    console.error("Smoke test logs:\n", logs);
  }

  expect(status).toBe("pass");
});
