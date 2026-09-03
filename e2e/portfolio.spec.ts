import { expect, test } from "@playwright/test";

const workLinks = [
  ["Snode", "/work/snode"],
  ["Coffeeting", "/work/coffeeting"],
  ["Matching Admin", "/work/matching-admin"],
  ["Moum", "/work/moum"],
  ["Butlerlee", "/work/butlerlee"],
  ["Touchpoint", "/work/touchpoint"],
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

  await page.getByRole("link", { name: "Snode 프로젝트 보기" }).click();
  await expect(page).toHaveURL(/\/work\/snode$/);
  await page.getByRole("link", { name: "다음 프로젝트 Coffeeting" }).click();
  await expect(page).toHaveURL(/\/work\/coffeeting$/);

  const pdf = await request.get("/dokyum-kim-portfolio.pdf");
  expect(pdf.ok()).toBeTruthy();
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
});

test("every landing card opens its project on the first activation", async ({ page }) => {
  for (const [name, route] of workLinks) {
    await page.goto("/");
    await page.getByRole("link", { name: `${name} 프로젝트 보기` }).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
  }
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

test("Career shows employment history before independent projects", async ({ page }) => {
  await page.goto("/career");
  const history = page.locator(".career-history");
  for (const company of [
    "서우노드",
    "커피팅주식회사",
    "프라우들리",
    "룩코",
    "올스케이프",
    "피그위",
  ]) {
    await expect(history.getByRole("heading", { name: company })).toBeVisible();
  }
  await expect(history).not.toContainText("Touchpoint");

  const independent = page.locator(".career-independent");
  await expect(independent.getByRole("heading", { name: "Touchpoint" })).toBeVisible();
  const historyBox = await history.boundingBox();
  const independentBox = await independent.boundingBox();
  expect(independentBox!.y).toBeGreaterThan(historyBox!.y + historyBox!.height - 1);

  await expect(page.getByText("서울시립대학교")).toBeVisible();
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

test("visitor footer stays usable when Redis is unavailable", async ({ page }) => {
  await page.route("**/api/visitors", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"count":null}',
    }),
  );
  await page.goto("/");
  await expect(page.locator(".site-visitor")).toContainText("VISITORS —");
});

test("mobile layout keeps navigation and content inside the viewport", async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 700 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
    await expect(page.getByRole("button", { name: "메뉴 열기" })).toBeVisible();
    await page.getByRole("button", { name: "메뉴 열기" }).click();
    await expect(page.getByRole("link", { name: /Touchpoint/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "커리어" })).toBeVisible();
    await expect(page.getByRole("link", { name: "이메일로 연락하기" })).toBeVisible();
    await page.getByRole("link", { name: "커리어" }).click();
    await expect(page).toHaveURL(/\/career$/);
  }
});

test("landing uses the approved editorial type roles", async ({ page }) => {
  await page.goto("/");
  const mastheadFont = await page.locator(".landing-masthead").evaluate(
    (element) => getComputedStyle(element).fontFamily,
  );
  const labelFont = await page.locator(".landing-thesis > p").evaluate(
    (element) => getComputedStyle(element).fontFamily,
  );
  expect(mastheadFont).toContain("Instrument Serif");
  expect(labelFont).toContain("Geist Mono");
});

test("landing entrance is staged and reduced-motion safe", async ({ page }) => {
  await page.goto("/");
  const delays = await Promise.all(
    [".landing-masthead", ".landing-thesis", ".project-runway"].map((selector) =>
      page.locator(selector).evaluate((element) => getComputedStyle(element).animationDelay),
    ),
  );
  expect(delays).toEqual(["0s", "0.16s", "0.36s"]);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  for (const selector of [".landing-masthead", ".landing-thesis", ".project-runway"]) {
    await expect(page.locator(selector)).toHaveCSS("animation-duration", "0s");
  }
});
