import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("carries the portfolio PDF download and the contact link", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    render(<SiteFooter />);

    const pdf = screen.getByRole("link", { name: "PDF" });
    expect(pdf).toHaveAttribute("href", "/dokyum-kim-portfolio.pdf");
    expect(pdf).toHaveAttribute("download");
    expect(screen.getByRole("link", { name: "CONTACT" })).toHaveAttribute(
      "href",
      "mailto:snfltptkd91@gmail.com",
    );
  });
});
