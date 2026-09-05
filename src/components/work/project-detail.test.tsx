import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getProjectBySlug } from "@/content/projects";
import { ProjectDetail } from "./project-detail";

describe("ProjectDetail", () => {
  it("opens with the product name, tagline, and the problem the project solved", () => {
    const project = getProjectBySlug("snode")!;
    render(<ProjectDetail project={project} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Snode");
    expect(heading).toHaveTextContent(project.story.tagline);
    expect(screen.getByText(project.story.headline)).toBeInTheDocument();
    for (const fact of project.story.facts) {
      expect(screen.getByText(fact.value)).toBeInTheDocument();
    }
  });

  it("renders every PDF chapter header, the outcome, and the takeaways", () => {
    const project = getProjectBySlug("coffeeting")!;
    render(<ProjectDetail project={project} />);

    for (const chapter of project.story.chapters) {
      expect(screen.getByRole("heading", { level: 2, name: chapter.title })).toBeInTheDocument();
    }
    expect(
      screen.getByRole("heading", { level: 2, name: project.story.outcome.title }),
    ).toBeInTheDocument();
    for (const takeaway of project.story.takeaways) {
      expect(screen.getByRole("heading", { level: 3, name: takeaway.title })).toBeInTheDocument();
    }
  });

  it("shows the PDF-sourced images with alternative text and captions", () => {
    const project = getProjectBySlug("moum")!;
    render(<ProjectDetail project={project} />);

    const media = [
      ...project.story.chapters.flatMap((chapter) => chapter.media ?? []),
      ...(project.story.outcome.media ?? []),
    ];
    expect(media.length).toBeGreaterThan(3);
    for (const item of media) {
      expect(screen.getByAltText(item.alt)).toHaveAttribute("src", `/${item.src}`);
      if (item.caption) {
        expect(screen.getByText(item.caption)).toBeInTheDocument();
      }
    }
  });

  it("does not invent metrics for Touchpoint", () => {
    const project = getProjectBySlug("touchpoint")!;
    const { container } = render(<ProjectDetail project={project} />);

    expect(container.querySelector(".work-shift")).toBeNull();
    expect(container.querySelector(".work-takeaways")).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: /검증 전/ })).toBeInTheDocument();
  });

  it("renders the harness viewer inside the Touchpoint system chapter", () => {
    const project = getProjectBySlug("touchpoint")!;
    render(<ProjectDetail project={project} />);

    const trigger = screen.getByRole("button", { name: "시스템 구조 다이어그램 크게 보기" });
    expect(trigger.closest("section")).toHaveAttribute("id", "system");
    expect(trigger.closest("section")).toHaveClass("work-chapter");
    expect(within(trigger).getByRole("img", { name: /시스템 구조/ })).toBeInTheDocument();
    expect(screen.getByText(project.story.chapters.find((c) => c.id === "system")!.body![0])).toBeInTheDocument();
  });

  it("renders no diagram viewer for cases without one", () => {
    const project = getProjectBySlug("snode")!;
    render(<ProjectDetail project={project} />);
    expect(screen.queryByRole("button", { name: /크게 보기/ })).toBeNull();
    expect(document.querySelector("section#system")).toBeNull();
  });
});
