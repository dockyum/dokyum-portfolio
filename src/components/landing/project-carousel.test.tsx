import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { projects } from "@/content/projects";

import { ProjectCarousel } from "./project-carousel";

describe("ProjectCarousel", () => {
  it("starts on Touchpoint and advances with ArrowRight", () => {
    render(<ProjectCarousel projects={projects} />);

    const carousel = screen.getByRole("region", { name: "프로젝트 둘러보기" });
    expect(screen.getByText(projects[0].activeLine)).toBeInTheDocument();

    fireEvent.keyDown(carousel, { key: "ArrowRight" });

    expect(screen.getByText(projects[1].activeLine)).toBeInTheDocument();
  });

  it("keeps every project reachable as a named link", () => {
    render(<ProjectCarousel projects={projects} />);

    for (const project of projects) {
      expect(
        screen.getByRole("link", { name: `${project.name} 프로젝트 보기` }),
      ).toHaveAttribute("href", project.route);
    }
  });

  it("selects a neighboring card before navigating", () => {
    render(<ProjectCarousel projects={projects} />);

    fireEvent.click(screen.getByRole("link", { name: "Butlerlee 프로젝트 보기" }));

    expect(screen.getByText(projects[1].activeLine)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Butlerlee 프로젝트 보기" }),
    ).toHaveAttribute("aria-current", "true");
  });
});
