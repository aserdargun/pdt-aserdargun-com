import { test, expect, type Page } from "@playwright/test";

async function paintedPixels(page: Page) {
  const png = await page.locator("canvas").screenshot();
  return page.evaluate(async (base64) => {
    const bitmap = await createImageBitmap(
      await (await fetch(`data:image/png;base64,${base64}`)).blob(),
    );
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d")!;
    context.drawImage(bitmap, 0, 0);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    bitmap.close();
    let painted = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 100 && data[i] + data[i + 1] + data[i + 2] < 650)
        painted++;
    }
    return painted / (canvas.width * canvas.height);
  }, png.toString("base64"));
}

test("animation moves the open impeller and Pause freezes the rendered frame", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".viewport")).toHaveAttribute("data-ready", "true");
  await page.getByRole("button", { name: "Cutaway", exact: true }).click();
  await page.getByRole("button", { name: "Show flow", exact: true }).click();
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  const canvas = page.locator("canvas");
  const before = await canvas.screenshot();
  await expect(async () => {
    expect((await canvas.screenshot()).equals(before)).toBe(false);
  }).toPass();
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  // Allow the final requested render to settle, then compare two separated frames.
  await page.waitForTimeout(250);
  const paused = await canvas.screenshot();
  await page.waitForTimeout(350);
  expect((await canvas.screenshot()).equals(paused)).toBe(true);
});

test("keyboard entry and portrait/landscape framing keep real geometry visible", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/");
  await expect(page.locator(".viewport")).toHaveAttribute("data-ready", "true");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to exhibit" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-view",
    "cutaway",
  );
  for (const size of [
    { width: 320, height: 740 },
    { width: 844, height: 390 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(size);
    for (const view of ["Assembly", "Exploded"]) {
      await page.getByRole("button", { name: view, exact: true }).click();
      await expect.poll(() => paintedPixels(page)).toBeGreaterThan(0.015);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});
