import { test, expect } from "@playwright/test";

const views = ["Assembly", "Cutaway", "Exploded", "Sensors"];
const conditions = [
  "Normal",
  "Cavitation",
  "Bearing wear",
  "Impeller wear",
  "Suction restriction",
];

test("all 20 view and condition combinations, nine components and eight sensors", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle("P-101 — Interactive Digital Twin");
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const view of views) {
    await page.getByRole("button", { name: view, exact: true }).click();
    for (const condition of conditions) {
      const button = page.getByRole("button", { name: condition, exact: true });
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".viewport")).toHaveAttribute(
        "data-ready",
        "true",
      );
      await expect(page.locator(".signal svg")).toHaveCount(4);
      await expect(page.locator(".signals [stroke-dasharray]")).toHaveCount(
        condition === "Normal" ? 0 : 4,
      );
      await expect(page.locator(".lesson h2")).not.toBeEmpty();
    }
  }
  const sensorNames = await page
    .locator(".component-list strong")
    .allTextContents();
  for (const name of sensorNames) {
    await page
      .locator(".component-list button")
      .filter({ has: page.getByText(name, { exact: true }) })
      .click();
    await expect(page.locator(".detail h3")).toHaveText(name);
    await expect(
      page.getByRole("button", { name: `Inspect ${name}`, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await page.getByRole("button", { name: "Assembly", exact: true }).click();
  const names = await page.locator(".component-list strong").allTextContents();
  expect(names).toHaveLength(9);
  for (const name of names) {
    await page
      .locator(".component-list button")
      .filter({ has: page.getByText(name, { exact: true }) })
      .click();
    await expect(page.locator(".detail h3")).toHaveText(name);
  }
  expect(errors).toEqual([]);
  await expect(page.locator("vite-error-overlay")).toHaveCount(0);
});

test("flow opens the cutaway; fault focus and camera keyboard controls respond", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".viewport")).toHaveAttribute("data-ready", "true");
  await page.getByRole("button", { name: "Show flow", exact: true }).click();
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-view",
    "cutaway",
  );
  await expect(page.locator(".flow-legend")).toBeVisible();
  await page.getByRole("button", { name: "Cavitation", exact: true }).click();
  await page
    .getByRole("button", { name: "Inspect this condition", exact: true })
    .click();
  await expect(page.locator(".detail h3")).toHaveText("Impeller");
  const canvas = page.locator("canvas");
  await canvas.focus();
  const before = await canvas.screenshot();
  await canvas.press("ArrowRight");
  await expect(async () => {
    expect((await canvas.screenshot()).equals(before)).toBe(false);
  }).toPass();
  await page.getByRole("button", { name: "Normal", exact: true }).click();
  await expect(page.locator(".detail")).toHaveCount(0);
  await page.getByRole("button", { name: "Exploded", exact: true }).click();
  await expect(page.locator(".actions button").first()).toBeDisabled();
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-playing",
    "false",
  );
});

test("motion preference updates immediately and does not restart without user action", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".viewport")).toHaveAttribute("data-ready", "true");
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-playing",
    "false",
  );
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-playing",
    "true",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-playing",
    "false",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-playing",
    "false",
  );
});

test("failed model keeps lessons available and disables unavailable scene actions", async ({
  page,
}) => {
  await page.route("**/models/p101-teaching.glb", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-status",
    "unavailable",
  );
  await expect(
    page.getByRole("button", { name: "Retry 3D exhibit", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".actions button").first()).toBeDisabled();
  await page.getByRole("button", { name: "Bearing wear", exact: true }).click();
  await expect(page.locator(".lesson h2")).toHaveText(
    "A small defect, repeated impacts",
  );
  await page.getByRole("button", { name: "Sensors", exact: true }).click();
  await page.locator(".component-list button").first().click();
  await expect(page.locator(".detail h3")).toHaveText("Suction pressure");
  await page.unroute("**/models/p101-teaching.glb");
  await page
    .getByRole("button", { name: "Retry 3D exhibit", exact: true })
    .click();
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-status",
    "ready",
  );
});

test("WebGL context loss falls back to the healthy static image", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".viewport")).toHaveAttribute("data-ready", "true");
  await page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
    const extension = canvas
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context");
    if (!extension) throw new Error("Context loss extension unavailable");
    extension.loseContext();
  });
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-status",
    "unavailable",
  );
  await expect(page.locator(".fallback")).toContainText("healthy assembly");
});

for (const width of [320, 390, 768, 1024]) {
  test(`responsive layout and sensor access at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.locator(".viewport")).toHaveAttribute(
      "data-ready",
      "true",
    );
    await page.getByRole("button", { name: "Sensors", exact: true }).click();
    await expect(page.locator(".sensor-marker")).toHaveCount(8);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const markers = page.locator(".sensor-marker");
    const boxes = await markers.evaluateAll((elements) =>
      elements.map((e) => {
        const { x, y, width, height } = e.getBoundingClientRect();
        return { x, y, width, height };
      }),
    );
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i],
          b = boxes[j];
        expect(
          a.x + a.width <= b.x ||
            b.x + b.width <= a.x ||
            a.y + a.height <= b.y ||
            b.y + b.height <= a.y,
          `markers ${i + 1} and ${j + 1} overlap`,
        ).toBe(true);
      }
    await page
      .getByRole("button", { name: "Inspect Radial vibration", exact: true })
      .click();
    await expect(page.locator(".detail h3")).toHaveText("Radial vibration");
    if (width <= 780) await expect(page.locator(".detail")).toBeInViewport();
    await page
      .getByRole("button", { name: "Back to measurement point ↑", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Inspect Radial vibration",
        exact: true,
      }),
    ).toBeFocused();
  });
}

test("JavaScript-disabled visitor can access the static model and downloads", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4319");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Download the healthy pump/ }),
  ).toBeVisible();
  await context.close();
});

test("WebGL unavailable at startup presents the static alternative without an unhandled error", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      kind: string,
      ...args: unknown[]
    ) {
      if (kind === "webgl2" || kind === "webgl") return null;
      return original.apply(this, [kind, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-status",
    "unavailable",
  );
  await expect(page.locator(".fallback")).toContainText("healthy assembly");
  expect(errors).toEqual([]);
});
