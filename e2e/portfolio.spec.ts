import { expect, test } from "@playwright/test";

const routes = [
  "/work/touchpoint",
  "/work/butlerlee",
  "/work/snode",
  "/work/coffeeting",
  "/work/matching-admin",
  "/work/moum",
] as const;

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
