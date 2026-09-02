import { describe, expect, it, vi } from "vitest";

import { registerVisit, type VisitorStore } from "./register-visit";

describe("registerVisit", () => {
  it("increments a browser that has not been counted", async () => {
    const increment = vi.fn().mockResolvedValue(42);
    const store: VisitorStore = {
      get: vi.fn(),
      increment,
    };

    await expect(registerVisit(store, false)).resolves.toEqual({
      count: 42,
      setCookie: true,
    });
    expect(increment).toHaveBeenCalledOnce();
  });

  it("reads without incrementing a counted browser", async () => {
    const increment = vi.fn();
    const store: VisitorStore = {
      get: vi.fn().mockResolvedValue(42),
      increment,
    };

    await expect(registerVisit(store, true)).resolves.toEqual({
      count: 42,
      setCookie: false,
    });
    expect(increment).not.toHaveBeenCalled();
  });
});
