import { expect, test, type Page } from "@playwright/test";

const workLinks = [
  ["Snode", "/work/snode"],
  ["Coffeeting", "/work/coffeeting"],
  ["Matching Admin", "/work/matching-admin"],
  ["Moum", "/work/moum"],
  ["Butlerlee", "/work/butlerlee"],
] as const;

const independentLinks = [["Touchpoint", "/work/touchpoint"]] as const;

const projectLinks = [...workLinks, ...independentLinks] as const;

const routes = projectLinks.map(([, route]) => route);

const entranceSelectors = [".landing-thesis", ".project-runway"];

function primaryCards(page: Page) {
  return page.locator('.project-card:not([aria-hidden="true"])');
}

function runwayOffset(page: Page) {
  return page.locator(".project-runway-track").evaluate((element) => {
    const match = /translate3d\((-?[\d.]+)px/.exec((element as HTMLElement).style.transform);
    return match ? -Number(match[1]) : 0;
  });
}

// A y position on the strip that is inside the viewport; the strip bottom can sit below the fold.
async function runwayGrabPoint(page: Page) {
  const runway = page.locator(".project-runway");
  await runway.scrollIntoViewIfNeeded();
  const box = (await runway.boundingBox())!;
  return Math.min(box.y + box.height - 60, page.viewportSize()!.height - 24);
}

// Cards past the right edge are clipped by the strip, so drag them into view before clicking.
async function openCard(page: Page, name: string) {
  const card = page.getByRole("link", { name: `${name} 프로젝트 보기` });
  const viewport = page.viewportSize()!;
  const box = (await card.boundingBox())!;
  const overflow = box.x + box.width + 24 - viewport.width;
  if (overflow > 0) {
    const y = await runwayGrabPoint(page);
    await page.mouse.move(viewport.width - 100, y);
    await page.mouse.down();
    await page.mouse.move(viewport.width - 100 - overflow, y, { steps: 20 });
    await page.mouse.up();
  }
  await card.click();
}

test("landing CTA, project journey, and PDF are available", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /제품 너머 병목까지/ })).toBeVisible();
  const footer = page.locator(".site-footer");
  await expect(footer.getByRole("link", { name: "CONTACT" })).toHaveAttribute(
    "href",
    "mailto:snfltptkd91@gmail.com",
  );
  await expect(footer.getByRole("link", { name: "PDF" })).toHaveAttribute(
    "href",
    "/dokyum-kim-portfolio.pdf",
  );
  await expect(page.locator('.site-header a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('.site-header a[href$=".pdf"]')).toHaveCount(0);

  await openCard(page, "Snode");
  await expect(page).toHaveURL(/\/work\/snode$/);
  await page.getByRole("link", { name: "다음 프로젝트 Coffeeting" }).click();
  await expect(page).toHaveURL(/\/work\/coffeeting$/);

  const pdf = await request.get("/dokyum-kim-portfolio.pdf");
  expect(pdf.ok()).toBeTruthy();
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
});

test("every landing card opens its project on the first activation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [name, route] of projectLinks) {
    await page.goto("/");
    await openCard(page, name);
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

test("Career shows employment from 2018 before independent projects", async ({ page }) => {
  await page.goto("/career");
  await expect(page.getByRole("heading", { name: "2018 — NOW" })).toBeVisible();

  const history = page.locator(".career-history");
  for (const company of ["서우노드", "커피팅주식회사", "프라우들리", "룩코", "올스케이프"]) {
    await expect(history.getByRole("heading", { name: company })).toBeVisible();
  }
  await expect(history).not.toContainText("피그위");
  await expect(history).not.toContainText("Touchpoint");

  const independent = page.locator("#independent");
  await expect(independent).toContainText("INDEPENDENT");
  await expect(independent.getByRole("heading", { name: "Touchpoint" })).toBeVisible();
  await expect(independent.getByRole("heading", { name: "피그위" })).toBeVisible();
  await expect(independent.getByRole("link", { name: "Touchpoint 프로젝트 보기" })).toHaveAttribute(
    "href",
    "/work/touchpoint",
  );
  const historyBox = await history.boundingBox();
  const independentBox = await independent.boundingBox();
  expect(independentBox!.y).toBeGreaterThan(historyBox!.y + historyBox!.height - 1);

  await expect(page.getByText("서울시립대학교")).toBeVisible();
});

test("desktop Work navigation opens on hover and reaches every work project", async ({ page }) => {
  for (const [name, route] of workLinks) {
    await page.goto("/");
    await page.getByRole("button", { name: "프로젝트 메뉴" }).hover();
    const menu = page.locator("#work-menu");
    await expect(menu).toBeVisible();
    await expect(menu).not.toContainText("Touchpoint");
    await menu.getByRole("link", { name: new RegExp(name) }).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
  }
});

test("Work closes again once the pointer leaves it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "프로젝트 메뉴" }).hover();
  await expect(page.locator("#work-menu")).toBeVisible();
  await page.mouse.move(400, 500);
  await expect(page.locator("#work-menu")).toBeHidden();
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
    await expect(page.getByRole("link", { name: /Snode/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "CAREER" })).toBeVisible();
    await page.getByRole("link", { name: "CAREER" }).click();
    await expect(page).toHaveURL(/\/career$/);
  }
});

test("mobile cards show their captions without hovering", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const caption = primaryCards(page).first().locator(".project-card-caption");
  await expect(caption).toHaveCSS("opacity", "1");
  await expect(caption).toContainText("Snode");
});

test("landing uses the approved editorial type roles", async ({ page }) => {
  await page.goto("/");
  const labelFont = await page.locator(".landing-thesis > p").evaluate(
    (element) => getComputedStyle(element).fontFamily,
  );
  const thesisFont = await page.locator(".landing-thesis h1").evaluate(
    (element) => getComputedStyle(element).fontFamily,
  );
  expect(labelFont).toContain("Geist Mono");
  expect(thesisFont).toContain("Pretendard");
  await expect(page.locator(".landing-masthead")).toHaveCount(0);
});

test("landing entrance is staged and reduced-motion safe", async ({ page }) => {
  await page.goto("/");
  const delays = await Promise.all(
    entranceSelectors.map((selector) =>
      page.locator(selector).evaluate((element) => getComputedStyle(element).animationDelay),
    ),
  );
  expect(delays).toEqual(["0s", "0.2s"]);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  for (const selector of entranceSelectors) {
    await expect(page.locator(selector)).toHaveCSS("animation-duration", "0s");
  }
});

test("Work dropdown rows keep the editorial grid across the full menu width", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "프로젝트 메뉴" }).click();
  const menu = page.locator("#work-menu");
  const menuWidth = (await menu.boundingBox())!.width;
  const rows = menu.locator(".site-project-link");
  await expect(rows).toHaveCount(workLinks.length);
  for (const row of await rows.all()) {
    await expect(row).toHaveCSS("display", "grid");
    await expect(row).toHaveCSS("text-transform", "none");
    await expect(row.locator(".site-project-tags")).toContainText("#");
    expect((await row.boundingBox())!.width).toBeGreaterThan(menuWidth - 4);
  }
});

test("project detail pages carry the PDF chapters, images, and takeaways", async ({ page }) => {
  await page.goto("/work/snode");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Snode");
  await expect(
    page.getByRole("heading", { level: 2, name: "회사의 성장이 정체되고 있는 원인은 뭘까?" }),
  ).toBeVisible();
  expect(await page.locator(".work-media img").count()).toBeGreaterThan(3);
  await expect(page.getByRole("heading", { level: 2, name: "Takeaways" })).toBeVisible();
  await expect(page.locator(".work-outcome")).toContainText("1,300만원");
});

test("runway cards vary in size on one baseline and the hovered card grows with a caption", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const cards = primaryCards(page);
  await expect(cards).toHaveCount(projectLinks.length);
  const boxes = await Promise.all((await cards.all()).map((card) => card.boundingBox()));
  expect(new Set(boxes.map((box) => Math.round(box!.height))).size).toBeGreaterThan(2);
  expect(new Set(boxes.map((box) => Math.round(box!.width))).size).toBeGreaterThan(2);
  const bottoms = boxes.map((box) => Math.round(box!.y + box!.height));
  expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThanOrEqual(1);

  const second = cards.nth(1);
  const caption = second.locator(".project-card-caption");
  await expect(caption).toHaveCSS("opacity", "0");
  const restingWidth = boxes[1]!.width;
  await second.hover();
  await expect.poll(async () => (await second.boundingBox())!.width).toBeGreaterThan(restingWidth);
  await expect(caption).toHaveCSS("opacity", "1");
  await expect(caption).toContainText("Coffeeting");
});

test("the runway drifts left on its own and pauses while a card is hovered", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1500);
  const before = await runwayOffset(page);
  await page.waitForTimeout(800);
  const after = await runwayOffset(page);
  expect(after - before).toBeGreaterThan(5);

  const box = (await primaryCards(page).nth(2).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(2000);
  const paused = await runwayOffset(page);
  await page.waitForTimeout(500);
  expect(await runwayOffset(page)).toBeCloseTo(paused, 3);
});

test("dragging the runway with the mouse moves the strip without opening a card", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const y = await runwayGrabPoint(page);
  await page.mouse.move(600, y);
  await page.mouse.down();
  await page.mouse.move(300, y, { steps: 12 });
  await page.mouse.up();
  expect(await runwayOffset(page)).toBeGreaterThan(200);
  await expect(page).toHaveURL(/\/$/);
});

test("detail and career heroes share the entrance and respect reduced motion", async ({ page }) => {
  await page.goto("/work/touchpoint");
  await expect(page.locator(".work-hero")).toHaveCSS("animation-name", "editorial-entrance");
  await page.goto("/career");
  await expect(page.locator(".career-hero")).toHaveCSS("animation-name", "editorial-entrance");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".career-hero")).toHaveCSS("animation-duration", "0s");
  await page.goto("/work/touchpoint");
  await expect(page.locator(".work-hero")).toHaveCSS("animation-duration", "0s");
  await page.goto("/");
  await expect(page.locator(".landing-thesis-word").first()).toHaveCSS("animation-duration", "0s");
});
