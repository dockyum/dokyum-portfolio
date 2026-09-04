import { expect, test, type Page } from "@playwright/test";

const STREAM_HEADERS = {
  "content-type": "text/event-stream",
  "x-vercel-ai-ui-message-stream": "v1",
};

function stream(text: string) {
  const chunks = [
    { type: "start", messageId: "a1" },
    { type: "text-start", id: "t1" },
    { type: "text-delta", id: "t1", delta: text },
    { type: "text-end", id: "t1" },
    { type: "finish" },
  ];

  return `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("")}data: [DONE]\n\n`;
}

async function mockAnswer(page: Page, text: string, headers: Record<string, string> = {}) {
  await page.route("**/api/chat", (route) =>
    route.fulfill({ status: 200, headers: { ...STREAM_HEADERS, ...headers }, body: stream(text) }),
  );
}

async function ask(page: Page, text: string) {
  const input = page.getByRole("textbox", { name: "docky에게 질문" });
  await input.fill(text);
  await input.press("Enter");
}

test("the trigger scrolls to the chat, focuses it and hides while it is in view", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "docky에게 물어보기" });
  await expect(trigger).toBeVisible();

  await trigger.click();

  await expect(page.locator("#ask-docky")).toBeInViewport();
  await expect(page.getByRole("textbox", { name: "docky에게 질문" })).toBeFocused();
  await expect(trigger).toHaveAttribute("data-hidden", "true");

  await page.goto("/career");
  await expect(page.getByRole("button", { name: "docky에게 물어보기" })).toHaveCount(0);
});

test("the first question expands the chat and streams the answer", async ({ page }) => {
  await mockAnswer(page, "커피팅에서는 운영 병목부터 봤어요.", {
    "x-twin-quota-limit": "8",
    "x-twin-quota-remaining": "7",
  });
  await page.goto("/");

  await ask(page, "커피팅에서 CPO로 무엇을 했나요?");

  await expect(page.locator(".ask-docky")).toHaveAttribute("data-state", "active");
  await expect(page.locator(".ask-docky-turn[data-role='user']")).toContainText(
    "커피팅에서 CPO로 무엇을 했나요?",
  );
  await expect(page.locator(".ask-docky-turn[data-role='assistant']")).toContainText(
    "커피팅에서는 운영 병목부터 봤어요.",
  );
  await expect(page.locator(".ask-docky-count")).toContainText("1 / 8");
  await expect(page.getByRole("textbox", { name: "docky에게 질문" })).toHaveAttribute(
    "placeholder",
    "이어서 물어보세요.",
  );
});

test("the limit state closes the input and offers email", async ({ page }) => {
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 429,
      headers: {
        "content-type": "application/json",
        "x-twin-quota-limit": "8",
        "x-twin-quota-remaining": "0",
      },
      body: '{"error":"이 세션의 대화 한도에 닿았어요."}',
    }),
  );
  await page.goto("/");

  await ask(page, "아홉 번째 질문");

  await expect(page.locator(".ask-docky-count")).toContainText("8 / 8");
  await expect(page.locator(".ask-docky-turn[data-role='system']")).toContainText(
    "이 세션의 대화 한도에 닿았어요.",
  );
  await expect(page.getByRole("textbox", { name: "docky에게 질문" })).toBeDisabled();
  await expect(page.locator(".ask-docky-limit").getByRole("link")).toHaveAttribute(
    "href",
    "mailto:snfltptkd91@gmail.com",
  );
});

test("the chat survives a detour to a project page", async ({ page }) => {
  await mockAnswer(page, "짧은 답");
  await page.goto("/");
  await ask(page, "질문");
  await expect(page.locator(".ask-docky-turn[data-role='assistant']")).toContainText("짧은 답");

  await page.goto("/work/snode");
  await expect(page.locator("main.work-page")).toBeVisible();
  await page.goBack();

  await expect(page.locator(".ask-docky")).toHaveAttribute("data-state", "active");
  await expect(page.locator(".ask-docky-turn[data-role='assistant']")).toContainText("짧은 답");
  await expect(page.locator(".ask-docky-count")).toContainText("1 / 8");
});

test("the chat is motion-safe and fits 320px", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".ask-docky-trigger-band")).toHaveCSS("animation-duration", "0s");

  await page.setViewportSize({ width: 320, height: 700 });
  await mockAnswer(page, "짧은 답");
  await ask(page, "질문");
  await expect(page.locator(".ask-docky")).toHaveAttribute("data-state", "active");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
  ).toBe(false);
});

test("the proxy answers 502 with a session cookie when the twin is unreachable", async ({ request }) => {
  const response = await request.post("/api/chat", {
    data: { messages: [{ id: "u1", role: "user", parts: [{ type: "text", text: "안녕" }] }] },
  });

  expect(response.status()).toBe(502);
  expect(await response.json()).toEqual({
    error: "지금은 대화할 수 없어요. 잠시 후 다시 시도해 주세요.",
  });
  expect(response.headers()["set-cookie"]).toContain("dk_chat_session_v1=");
});
