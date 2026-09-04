import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const fetchMock = vi.fn();

function chatRequest(body: string, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

const okBody = JSON.stringify({
  messages: [{ id: "u1", role: "user", parts: [{ type: "text", text: "안녕" }] }],
});

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(
      new Response("data: [DONE]\n\n", {
        status: 200,
        headers: { "content-type": "text/event-stream", "x-twin-quota-remaining": "7" },
      }),
    );
    process.env.TWIN_API_URL = "https://twin.example";
    delete process.env.TWIN_PROXY_SECRET;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.TWIN_API_URL;
  });

  it("answers 503 when the twin is not configured", async () => {
    delete process.env.TWIN_API_URL;

    const response = await POST(chatRequest(okBody));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "트윈이 아직 연결되지 않았어요." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects bodies that are not JSON objects", async () => {
    const response = await POST(chatRequest("not json"));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects bodies over 64KB", async () => {
    const response = await POST(chatRequest(JSON.stringify({ messages: "x".repeat(65 * 1024) })));

    expect(response.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("issues a session cookie and forwards the id to the twin", async () => {
    const response = await POST(chatRequest(okBody, { "x-twin-conversation": "conv-1" }));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-twin-quota-remaining")).toBe("7");
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/^dk_chat_session_v1=[0-9a-f-]{36};/);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=lax");
    expect(cookie).not.toContain("Max-Age");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const sent = init.headers as Record<string, string>;
    expect(url).toBe("https://twin.example/api/chat");
    expect(cookie.startsWith(`dk_chat_session_v1=${sent["x-twin-session"]};`)).toBe(true);
    expect(sent["x-twin-conversation"]).toBe("conv-1");
    expect(init.body).toBe(okBody);
    await expect(response.text()).resolves.toBe("data: [DONE]\n\n");
  });

  it("reuses the cookie session and sends the proxy secret when configured", async () => {
    process.env.TWIN_PROXY_SECRET = "s3cret";

    const response = await POST(
      chatRequest(okBody, { cookie: "dk_chat_session_v1=6f1c2a4e-3b2d-4c7a-9e1f-0a1b2c3d4e5f" }),
    );

    expect(response.headers.get("set-cookie")).toBeNull();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const sent = init.headers as Record<string, string>;
    expect(sent["x-twin-session"]).toBe("6f1c2a4e-3b2d-4c7a-9e1f-0a1b2c3d4e5f");
    expect(sent.authorization).toBe("Bearer s3cret");
  });

  it("still sets the cookie on an upstream 429", async () => {
    fetchMock.mockResolvedValue(Response.json({ error: "한도" }, { status: 429 }));

    const response = await POST(chatRequest(okBody));

    expect(response.status).toBe(429);
    expect(response.headers.get("set-cookie")).toContain("dk_chat_session_v1=");
  });
});
