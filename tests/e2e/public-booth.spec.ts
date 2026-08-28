import { expect, test } from "@playwright/test";

test("public booth can open and request camera after start", async ({ page }) => {
  await page.goto("/event/alam-ghina/booth");
  await expect(page.getByRole("heading", { name: /Alam & Ghina/i })).toBeVisible();
  await page.getByRole("button", { name: /Mulai Foto/i }).click();
  await expect(page.getByRole("button", { name: /Capture/i })).toBeVisible();
});
