import { describe, expect, it, vi } from "vitest";

import { buildUpstreamRequest, forwardChat, UNAVAILABLE_MESSAGE } from "./proxy";

const base = {
  upstreamUrl: "https://twin.example",
  body: '{"messages":[]}',
  sessionId: "6f1c2a4e-3b2d-4c7a-9e1f-0a1b2c3d4e5f",
  conversationId: "9b7d0f3a-1c2e-4d5f-8a9b-0c1d2e3f4a5b",
};

describe("buildUpstreamRequest", () => {
  it("posts the body to the twin with session and conversation headers", () => {
    const { url, init } = buildUpstreamRequest({ ...base, signal: new AbortController().signal });

    expect(url).toBe("https://twin.example/api/chat");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(base.body);
    expect(init.headers).toEqual({
      "content-type": "application/json",
      "x-twin-session": base.sessionId,
      "x-twin-conversation": base.conversationId,
    });
  });

  it("strips a trailing slash from the upstream url", () => {
    expect(
      buildUpstreamRequest({
        ...base,
        upstreamUrl: "https://twin.example/",
        signal: new AbortController().signal,
      }).url,
    ).toBe("https://twin.example/api/chat");
  });

  it("omits an invalid conversation id and adds the bearer secret when configured", () => {
    const { init } = buildUpstreamRequest({
      ...base,
      conversationId: "bad id!",
      secret: "s3cret",
      signal: new AbortController().signal,
    });

    expect(init.headers).toEqual({
      "content-type": "application/json",
      "x-twin-session": base.sessionId,
      authorization: "Bearer s3cret",
    });
  });

  it("passes the abort signal through", () => {
    const signal = new AbortController().signal;

    expect(buildUpstreamRequest({ ...base, signal }).init.signal).toBe(signal);
  });
});

describe("forwardChat", () => {
  it("streams the upstream body with only the allowed headers", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response("data: [DONE]\n\n", {
        status: 200,
        headers: {
          "content-type": "text/event-stream",
          "x-vercel-ai-ui-message-stream": "v1",
          "x-twin-quota-limit": "8",
          "x-twin-quota-remaining": "7",
          "x-powered-by": "leak",
        },
      }),
    );

    const response = await forwardChat({ ...base, signal: new AbortController().signal, fetch });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(response.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");
    expect(response.headers.get("x-twin-quota-limit")).toBe("8");
    expect(response.headers.get("x-twin-quota-remaining")).toBe("7");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-powered-by")).toBeNull();
    await expect(response.text()).resolves.toBe("data: [DONE]\n\n");
  });

  it("keeps the upstream status for errors such as 429", async () => {
    const fetch = vi.fn().mockResolvedValue(
      Response.json({ error: "한도" }, { status: 429, headers: { "x-twin-quota-remaining": "0" } }),
    );

    const response = await forwardChat({ ...base, signal: new AbortController().signal, fetch });

    expect(response.status).toBe(429);
    expect(response.headers.get("x-twin-quota-remaining")).toBe("0");
    await expect(response.json()).resolves.toEqual({ error: "한도" });
  });

  it("answers 502 with the user-facing message when the twin is unreachable", async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));

    const response = await forwardChat({ ...base, signal: new AbortController().signal, fetch });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: UNAVAILABLE_MESSAGE });
  });

  it("answers 499 when the visitor aborted the request", async () => {
    const controller = new AbortController();
    const fetch = vi.fn().mockImplementation(() => {
      controller.abort();
      return Promise.reject(new DOMException("aborted", "AbortError"));
    });

    const response = await forwardChat({ ...base, signal: controller.signal, fetch });

    expect(response.status).toBe(499);
  });
});
