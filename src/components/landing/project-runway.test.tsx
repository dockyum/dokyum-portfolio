import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { projects } from "@/content/projects";
import { ProjectRunway } from "./project-runway";

describe("ProjectRunway", () => {
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
});
