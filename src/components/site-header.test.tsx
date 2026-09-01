import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("keeps email primary and PDF download separate", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "이메일로 연락하기" })).toHaveAttribute(
      "href",
      "mailto:snfltptkd91@gmail.com",
    );
    expect(screen.getByRole("link", { name: "포트폴리오 PDF" })).toHaveAttribute(
      "href",
      "/dokyum-kim-portfolio.pdf",
    );
    expect(screen.getByRole("link", { name: "포트폴리오 PDF" })).toHaveAttribute(
      "download",
    );
  });
});
