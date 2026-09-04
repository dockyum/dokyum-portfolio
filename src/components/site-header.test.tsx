import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getProjectsByKind } from "@/content/projects";
import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: () => "/career" }));

const workProjects = getProjectsByKind("career");

describe("SiteHeader", () => {
  beforeEach(() => render(<SiteHeader />));
  afterEach(() => {
    vi.useRealTimers();
  });

  it("exposes every work project from Work and leaves independent work out", () => {
    fireEvent.click(screen.getByRole("button", { name: "프로젝트 메뉴" }));
    const menu = within(document.getElementById("work-menu")!);
    for (const project of workProjects) {
      expect(menu.getByRole("link", { name: new RegExp(project.name) })).toHaveAttribute(
        "href",
        project.route,
      );
    }
    expect(menu.getAllByRole("link")).toHaveLength(workProjects.length);
    expect(menu.queryByRole("link", { name: /Touchpoint/ })).toBeNull();
  });

  it("opens Work when the mouse enters and closes shortly after it leaves", () => {
    vi.useFakeTimers();
    const trigger = screen.getByRole("button", { name: "프로젝트 메뉴" });
    const navigation = trigger.closest(".site-work-navigation")!;

    fireEvent.pointerEnter(navigation, { pointerType: "mouse" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerLeave(navigation, { pointerType: "mouse" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    act(() => {
      vi.runAllTimers();
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps Work open when a mouse user clicks the trigger they hovered", () => {
    const trigger = screen.getByRole("button", { name: "프로젝트 메뉴" });
    const navigation = trigger.closest(".site-work-navigation")!;
    fireEvent.pointerEnter(navigation, { pointerType: "mouse" });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("does not open Work for touch pointers, so a tap still toggles it", () => {
    const trigger = screen.getByRole("button", { name: "프로젝트 메뉴" });
    const navigation = trigger.closest(".site-work-navigation")!;
    fireEvent.pointerEnter(navigation, { pointerType: "touch" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps only Work and Career in the header; PDF and contact live in the footer", () => {
    expect(screen.getByRole("link", { name: "CAREER" })).toHaveAttribute("href", "/career");
    expect(screen.queryByRole("link", { name: "PDF" })).toBeNull();
    expect(screen.queryByRole("link", { name: "CONTACT" })).toBeNull();
    expect(screen.queryByRole("link", { name: /INDEPENDENT/ })).toBeNull();
  });

  it("describes each work project with hashtags instead of an outcome", () => {
    fireEvent.click(screen.getByRole("button", { name: "프로젝트 메뉴" }));
    const menu = document.getElementById("work-menu")!;
    for (const project of workProjects) {
      for (const tag of project.tags) {
        expect(menu).toHaveTextContent(tag);
      }
    }
    expect(menu).not.toHaveTextContent("만원");
    expect(menu.querySelector(".site-project-outcome")).toBeNull();
  });

  it("marks the current section and closes with Escape", () => {
    expect(screen.getByRole("link", { name: "CAREER" })).toHaveAttribute("aria-current", "page");
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
    const menu = within(document.getElementById("mobile-menu")!);
    for (const project of workProjects) {
      expect(menu.getByRole("link", { name: new RegExp(project.name) })).toHaveAttribute(
        "href",
        project.route,
      );
    }
    expect(menu.queryByRole("link", { name: /Touchpoint/ })).toBeNull();
    expect(menu.getByRole("link", { name: "CAREER" })).toBeInTheDocument();
    expect(menu.queryByRole("link", { name: "CONTACT" })).toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });
});
