import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VisitorCount } from "./visitor-count";

describe("VisitorCount", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("formats a successful count with six digits", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ count: 42 }),
      }),
    );

    render(<VisitorCount />);

    await waitFor(() => expect(screen.getByText("000042")).toBeInTheDocument());
  });

  it("shows the documented unavailable state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    render(<VisitorCount />);

    await waitFor(() => expect(screen.getByText("—")).toBeInTheDocument());
  });
});
