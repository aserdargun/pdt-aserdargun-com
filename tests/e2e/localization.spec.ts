import { test, expect } from "@playwright/test";
import { join } from "node:path";
import { tmpdir } from "node:os";

for (const width of [320, 390, 1440]) {
  test(`Turkish exhibit and language switch preserve authored state at ${width}px`, async ({
    page,
  }) => {
    test.slow(); // Full language, scenario and reload flow, including 3D setup.
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning") errors.push(m.text());
    });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/?lang=tr&condition=bearing&view=sensors");
    await expect(page).toHaveTitle("PDT - Etkileşimli Dijital İkiz");
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.locator(".viewport")).toHaveAttribute(
      "data-ready",
      "true",
    );
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Etkileşimli",
    );
    await page
      .getByRole("button", { name: "İncele Radyal titreşim", exact: true })
      .click();
    await expect(page.locator(".detail h3")).toHaveText("Radyal titreşim");
    await expect(page.locator(".detail-unit")).toContainText(
      "m/s² (ölçüm yok)",
    );
    await expect(page.locator(".lesson h2")).toHaveText(
      "Küçük bir kusur, tekrarlayan darbeler",
    );
    await page.getByRole("button", { name: "English", exact: true }).click();
    await expect(page.locator(".detail h3")).toHaveText("Radial vibration");
    await expect(page.locator(".viewport")).toHaveAttribute(
      "data-condition",
      "bearing",
    );
    await expect(page.locator(".viewport")).toHaveAttribute(
      "data-view",
      "sensors",
    );
    await expect(page).toHaveURL(/lang=en/);
    await expect(page.locator("canvas")).toHaveAttribute(
      "aria-label",
      /Pump camera/,
    );
    await page.getByRole("button", { name: "Türkçe", exact: true }).click();
    await expect(page.locator("canvas")).toHaveAttribute(
      "aria-label",
      /Pompa kamerası/,
    );
    await page.getByRole("button", { name: "Montaj", exact: true }).click();
    await page.locator(".component-list button").first().click();
    await expect(page.locator(".detail h3")).toHaveText("Elektrik motoru");
    for (const condition of [
      "Normal",
      "Kavitasyon",
      "Rulman aşınması",
      "Çark aşınması",
      "Emiş kısıtlaması",
    ]) {
      await page.getByRole("button", { name: condition, exact: true }).click();
      await expect(page.locator(".ils-question")).toContainText(
        `${condition} durumunda`,
      );
    }
    await page
      .getByRole("button", { name: "Akışı göster", exact: true })
      .click();
    await expect(page.locator(".flow-legend")).toContainText("Emiş → Çark");
    await expect(page).toHaveURL(/view=cutaway/);
    await page.reload();
    await expect(page.locator(".viewport")).toHaveAttribute(
      "data-ready",
      "true",
    );
    await expect(page.locator(".viewport")).toHaveAttribute(
      "data-condition",
      "restriction",
    );
    await expect(page.locator(".viewport")).toHaveAttribute(
      "data-view",
      "cutaway",
    );
    await page.getByText("Varsayımlar", { exact: true }).click();
    await expect(
      page.getByText("Kurgusal eğitim varlığı", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Portföy", exact: true }),
    ).toHaveAttribute("href", "https://aserdargun.com/tr/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("vite-error-overlay")).toHaveCount(0);
    expect(errors).toEqual([]);
    await page.screenshot({
      path: join(tmpdir(), `pdt-content-tr-${width}.png`),
      fullPage: true,
    });
  });
}

test("Turkish static fallback retains language and selected condition on retry", async ({
  page,
}) => {
  await page.route("**/models/p101-teaching.glb", (route) => route.abort());
  await page.goto("/?lang=tr&condition=impeller");
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-status",
    "unavailable",
  );
  await expect(page.locator(".fallback")).toContainText("sağlıklı montajı");
  await page
    .getByRole("button", { name: "Emiş kısıtlaması", exact: true })
    .click();
  await expect(page.locator(".lesson h2")).toHaveText(
    "Sorun giriş hattında başlar",
  );
  await page.unroute("**/models/p101-teaching.glb");
  await page
    .getByRole("button", { name: "3B sergiyi yeniden dene", exact: true })
    .click();
  await expect(page.locator(".viewport")).toHaveAttribute("data-ready", "true");
  await expect(page.locator(".viewport")).toHaveAttribute(
    "data-condition",
    "restriction",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
});
