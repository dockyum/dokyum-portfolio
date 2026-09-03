import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { projects } from "@/content/projects";
import { ProjectRunway } from "./project-runway";

describe("ProjectRunway", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the Korean thesis and every direct project link", () => {
    render(<ProjectRunway projects={projects} />);
    expect(
      screen.getByRole("heading", {
        name: "제품 밖의 병목까지 찾아, 사업이 흐르는 구조로 바꿉니다.",
      }),
    ).toBeInTheDocument();
    for (const project of projects) {
      expect(screen.getByRole("link", { name: `${project.name} 프로젝트 보기` })).toHaveAttribute(
        "href",
        project.route,
      );
    }
  });

  it("splits the thesis into words with staggered delays so it resolves word by word", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    const words = Array.from(container.querySelectorAll<HTMLElement>(".landing-thesis-word"));
    expect(words.map((word) => word.textContent?.trim())).toEqual([
      "제품",
      "밖의",
      "병목까지",
      "찾아,",
      "사업이",
      "흐르는",
      "구조로",
      "바꿉니다.",
    ]);
    const delays = words.map((word) => Number.parseFloat(word.style.animationDelay));
    for (let index = 1; index < delays.length; index += 1) {
      expect(delays[index]).toBeGreaterThan(delays[index - 1]);
    }
  });

  it("keeps visible card bands free of descriptive text", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    expect(container.querySelectorAll(".project-card-logo")).toHaveLength(6);
    expect(container.querySelectorAll(".project-card-copy")).toHaveLength(0);
  });

  it("updates the separate runway index when a project receives focus", () => {
    render(<ProjectRunway projects={projects} />);
    fireEvent.focus(screen.getByRole("link", { name: "Butlerlee 프로젝트 보기" }));
    expect(screen.getByText("05 / 06")).toBeInTheDocument();
    expect(screen.getByText("Butlerlee")).toBeInTheDocument();
    expect(screen.getByText(projects[4].activeLine)).toBeInTheDocument();
  });

  it("updates runway metadata when a project receives a pointer enter", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    fireEvent.pointerEnter(screen.getByRole("link", { name: "Butlerlee 프로젝트 보기" }));
    const meta = container.querySelector(".project-runway-meta");
    expect(meta).toHaveTextContent("05 / 06");
    expect(meta).toHaveTextContent("Butlerlee");
    expect(meta).toHaveTextContent(projects[4].activeLine);
  });

  it("labels career work and independent projects in the runway index", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    const meta = container.querySelector(".project-runway-meta");
    expect(meta).toHaveTextContent("CAREER");
    expect(meta).toHaveTextContent("Snode");
    fireEvent.pointerEnter(screen.getByRole("link", { name: "Touchpoint 프로젝트 보기" }));
    expect(meta).toHaveTextContent("INDEPENDENT");
    expect(meta).toHaveTextContent("06 / 06");
    expect(container.querySelectorAll(".project-card .project-runway-kind")).toHaveLength(0);
  });

  it("steps through the cards with the arrow controls and brings each card into view", () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const { container } = render(<ProjectRunway projects={projects} />);
    const previous = screen.getByRole("button", { name: "이전 프로젝트 카드" });
    const next = screen.getByRole("button", { name: "다음 프로젝트 카드" });
    const meta = container.querySelector(".project-runway-meta");

    expect(previous).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(previous);
    expect(meta).toHaveTextContent("01 / 06");
    expect(scrollIntoView).not.toHaveBeenCalled();

    fireEvent.click(next);
    expect(meta).toHaveTextContent("02 / 06");
    expect(meta).toHaveTextContent(projects[1].name);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(
      screen.getByRole("link", { name: `${projects[1].name} 프로젝트 보기` }),
    );
    expect(scrollIntoView).toHaveBeenLastCalledWith(
      expect.objectContaining({ inline: "center", block: "nearest" }),
    );

    fireEvent.click(previous);
    expect(meta).toHaveTextContent("01 / 06");
    expect(previous).toHaveAttribute("aria-disabled", "true");
  });

  it("drags the runway with the mouse and swallows the click that ends the drag", () => {
    vi.useFakeTimers();
    const { container } = render(<ProjectRunway projects={projects} />);
    const runway = container.querySelector<HTMLElement>(".project-runway")!;
    const card = screen.getByRole("link", { name: "Touchpoint 프로젝트 보기" });

    fireEvent.pointerDown(card, { pointerType: "mouse", button: 0, clientX: 400 });
    fireEvent.pointerMove(window, { pointerType: "mouse", clientX: 300 });
    expect(runway.scrollLeft).toBe(100);
    expect(runway).toHaveClass("is-dragging");

    fireEvent.pointerUp(window, { pointerType: "mouse" });
    expect(runway).not.toHaveClass("is-dragging");
    expect(fireEvent.click(card)).toBe(false);

    vi.runAllTimers();
    expect(fireEvent.click(card)).toBe(true);
  });

  it("leaves touch pointers to native scrolling", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    const runway = container.querySelector<HTMLElement>(".project-runway")!;
    const card = screen.getByRole("link", { name: "Touchpoint 프로젝트 보기" });

    fireEvent.pointerDown(card, { pointerType: "touch", button: 0, clientX: 400 });
    fireEvent.pointerMove(window, { pointerType: "touch", clientX: 300 });
    fireEvent.pointerUp(window, { pointerType: "touch" });
    expect(runway.scrollLeft).toBe(0);
    expect(runway).not.toHaveClass("is-dragging");
    expect(fireEvent.click(card)).toBe(true);
  });
});
