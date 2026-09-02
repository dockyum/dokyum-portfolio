import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  store: { get: vi.fn(), increment: vi.fn() },
}));

vi.mock("@/visitors/redis-store", () => ({
  createRedisVisitorStore: () => mocks.store,
}));

import { POST } from "./route";

describe("POST /api/visitors", () => {
  beforeEach(() => vi.clearAllMocks());

  it("increments once and sets the 400-day cookie", async () => {
    mocks.store.increment.mockResolvedValueOnce(42);

    const response = await POST(
      new NextRequest("http://localhost/api/visitors", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ count: 42 });
    expect(response.headers.get("set-cookie")).toContain("dk_portfolio_visited_v1=1");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=34560000");
  });

  it("reads without incrementing when the cookie exists", async () => {
    mocks.store.get.mockResolvedValueOnce(42);

    const response = await POST(
      new NextRequest("http://localhost/api/visitors", {
        method: "POST",
        headers: { cookie: "dk_portfolio_visited_v1=1" },
      }),
    );

    await expect(response.json()).resolves.toEqual({ count: 42 });
    expect(mocks.store.increment).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("returns the nullable 503 contract when Redis is unavailable", async () => {
    mocks.store.increment.mockRejectedValueOnce(new Error("unavailable"));

    const response = await POST(
      new NextRequest("http://localhost/api/visitors", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ count: null });
  });
});
