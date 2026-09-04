import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { projects } from "@/content/projects";
import { ProjectRunway } from "./project-runway";

const thesis = "제품 밖의 병목까지 찾아, 사업이 성장하는 구조를 만듭니다.";

function primaryCard(name: string) {
  return screen.getByRole("link", { name: `${name} 프로젝트 보기` });
}

function trackOf(container: HTMLElement) {
  return container.querySelector<HTMLElement>(".project-runway-track")!;
}

function dragWithMouse(card: HTMLElement, from: number, to: number) {
  fireEvent.pointerDown(card, { pointerType: "mouse", button: 0, clientX: from, pointerId: 1 });
  fireEvent.pointerMove(card, { pointerType: "mouse", clientX: to, pointerId: 1 });
  fireEvent.pointerUp(card, { pointerType: "mouse", clientX: to, pointerId: 1 });
}

describe("ProjectRunway", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the Korean thesis as the only large statement and every direct project link", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    expect(screen.getByRole("heading", { name: thesis })).toBeInTheDocument();
    expect(container.querySelector(".landing-masthead")).toBeNull();
    for (const project of projects) {
      expect(primaryCard(project.name)).toHaveAttribute("href", project.route);
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
      "성장하는",
      "구조를",
      "만듭니다.",
    ]);
    const delays = words.map((word) => Number.parseFloat(word.style.animationDelay));
    for (let index = 1; index < delays.length; index += 1) {
      expect(delays[index]).toBeGreaterThan(delays[index - 1]);
    }
  });

  it("duplicates the card strip for a seamless loop and hides the copy from assistive tech", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    const cards = Array.from(container.querySelectorAll<HTMLElement>(".project-card"));
    expect(cards).toHaveLength(projects.length * 2);
    for (const copy of cards.slice(projects.length)) {
      expect(copy).toHaveAttribute("aria-hidden", "true");
      expect(copy).toHaveAttribute("tabindex", "-1");
    }
    expect(screen.getAllByRole("link")).toHaveLength(projects.length);
  });

  it("captions each card with its name and outcome, tagging independent work only", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    for (const project of projects) {
      const card = within(primaryCard(project.name));
      const caption = card.getByText(project.activeLine).closest(".project-card-caption")!;
      expect(caption).toHaveTextContent(project.name);
      if (project.kind === "independent") {
        expect(caption).toHaveTextContent("INDEPENDENT");
      } else {
        expect(caption).not.toHaveTextContent("INDEPENDENT");
      }
    }
    expect(container.querySelectorAll(".project-card-logo")).toHaveLength(0);
    expect(container.querySelectorAll(".project-runway-meta")).toHaveLength(0);
  });

  it("drags the strip with the mouse and swallows the click that ends the drag", () => {
    // Fake only timeouts: the drift loop re-arms requestAnimationFrame forever.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { container } = render(<ProjectRunway projects={projects} />);
    const runway = container.querySelector<HTMLElement>(".project-runway")!;
    const card = primaryCard("Touchpoint");

    fireEvent.pointerDown(card, { pointerType: "mouse", button: 0, clientX: 400, pointerId: 1 });
    fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 300, pointerId: 1 });
    expect(trackOf(container).style.transform).toMatch(/translate3d\(-100px/);
    expect(runway).toHaveClass("is-dragging");

    fireEvent.pointerUp(card, { pointerType: "mouse", clientX: 300, pointerId: 1 });
    expect(runway).not.toHaveClass("is-dragging");
    expect(fireEvent.click(card)).toBe(false);

    vi.runAllTimers();
    expect(fireEvent.click(card)).toBe(true);
  });

  it("lets a small pointer wobble through as a click", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    const runway = container.querySelector<HTMLElement>(".project-runway")!;
    const card = primaryCard("Snode");
    fireEvent.pointerDown(card, { pointerType: "mouse", button: 0, clientX: 400, pointerId: 1 });
    fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 403, pointerId: 1 });
    fireEvent.pointerUp(card, { pointerType: "mouse", clientX: 403, pointerId: 1 });
    expect(runway).not.toHaveClass("is-dragging");
    expect(fireEvent.click(card)).toBe(true);
  });

  it("drags with touch pointers too, since the strip no longer scrolls natively", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    const card = primaryCard("Touchpoint");
    fireEvent.pointerDown(card, { pointerType: "touch", button: 0, clientX: 400, pointerId: 2 });
    fireEvent.pointerMove(card, { pointerType: "touch", clientX: 250, pointerId: 2 });
    expect(trackOf(container).style.transform).toMatch(/translate3d\(-150px/);
    fireEvent.pointerUp(card, { pointerType: "touch", clientX: 250, pointerId: 2 });
  });

  it("brings a card back into view when it receives keyboard focus", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    dragWithMouse(primaryCard("Touchpoint"), 400, 300);
    expect(trackOf(container).style.transform).toMatch(/translate3d\(-100px/);
    // Every card sits at offsetLeft 0 in jsdom, so revealing it pulls the strip back to the start.
    fireEvent.focus(primaryCard("Snode"));
    expect(trackOf(container).style.transform).toMatch(/translate3d\(0px/);
  });
});
