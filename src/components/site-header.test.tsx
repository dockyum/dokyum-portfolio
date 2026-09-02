import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { projects } from "@/content/projects";
import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: () => "/career" }));

describe("SiteHeader", () => {
  beforeEach(() => render(<SiteHeader />));

  it("exposes every project from Work in one interaction", () => {
    fireEvent.click(screen.getByRole("button", { name: "프로젝트 메뉴" }));
    for (const project of projects) {
      expect(screen.getByRole("link", { name: new RegExp(project.name) })).toHaveAttribute(
        "href",
        project.route,
      );
    }
  });

  it("keeps Career, PDF, and email globally available", () => {
    expect(screen.getByRole("link", { name: "커리어" })).toHaveAttribute("href", "/career");
    expect(screen.getByRole("link", { name: "포트폴리오 PDF" })).toHaveAttribute(
      "href",
      "/dokyum-kim-portfolio.pdf",
    );
    expect(screen.getByRole("link", { name: "이메일로 연락하기" })).toHaveAttribute(
      "href",
      "mailto:snfltptkd91@gmail.com",
    );
  });

  it("marks the current section and closes with Escape", () => {
    expect(screen.getByRole("link", { name: "커리어" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const trigger = screen.getByRole("button", { name: "프로젝트 메뉴" });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("locks background scroll while the mobile menu is open", () => {
    const trigger = screen.getByRole("button", { name: "메뉴 열기" });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.body.style.overflow).toBe("hidden");
    for (const project of projects) {
      expect(screen.getByRole("link", { name: new RegExp(project.name) })).toHaveAttribute(
        "href",
        project.route,
      );
    }
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });
});
