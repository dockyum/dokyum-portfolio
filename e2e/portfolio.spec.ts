import { expect, test } from "@playwright/test";

const workLinks = [
  ["Touchpoint", "/work/touchpoint"],
  ["Butlerlee", "/work/butlerlee"],
  ["Snode", "/work/snode"],
  ["Coffeeting", "/work/coffeeting"],
  ["Matching Admin", "/work/matching-admin"],
  ["Moum", "/work/moum"],
] as const;

const routes = workLinks.map(([, route]) => route);

test("landing CTA, project journey, and PDF are available", async ({ page, request }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /제품 밖의 병목까지/ }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "이메일로 연락하기" })).toHaveAttribute(
    "href",
    "mailto:snfltptkd91@gmail.com",
  );

  await page.getByRole("link", { name: "Touchpoint 프로젝트 보기" }).click();
  await expect(page).toHaveURL(/\/work\/touchpoint$/);
  await page.getByRole("link", { name: "다음 프로젝트 Butlerlee" }).click();
  await expect(page).toHaveURL(/\/work\/butlerlee$/);

  const pdf = await request.get("/dokyum-kim-portfolio.pdf");
  expect(pdf.ok()).toBeTruthy();
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
});

test("all project routes render and the old Snode slug redirects", async ({ page }) => {
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("main.work-page")).toBeVisible();
  }

  await page.goto("/work/snod");
  await expect(page).toHaveURL(/\/work\/snode$/);
});

test("desktop Work navigation reaches every project in one activation", async ({ page }) => {
  for (const [name, route] of workLinks) {
    await page.goto("/");
    await page.getByRole("button", { name: "프로젝트 메뉴" }).click();
    await page.locator("#work-menu").getByRole("link", { name: new RegExp(name) }).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
  }
});

test("project logos keep their proportions and Korean titles wrap by word", async ({ page }) => {
  const aspectRatioWarnings: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("either width or height modified")) {
      aspectRatioWarnings.push(message.text());
    }
  });

  await page.goto("/");
  await page.waitForTimeout(300);
  expect(aspectRatioWarnings).toEqual([]);

  await page.goto("/work/touchpoint");
  const wordBreak = await page.locator(".work-hero h1").evaluate((element) =>
    getComputedStyle(element).getPropertyValue("word-break"),
  );
  expect(wordBreak).toBe("keep-all");
});

test("social metadata uses the configured local origin", async ({ page }) => {
  await page.goto("/work/touchpoint");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://127.0.0.1:4173/work/touchpoint",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /^http:\/\/127\.0\.0\.1:4173\//,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    /^http:\/\/127\.0\.0\.1:4173\//,
  );
});
