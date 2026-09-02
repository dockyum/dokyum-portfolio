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
    expect(screen.getByText("02 / 06")).toBeInTheDocument();
    expect(screen.getByText("Butlerlee")).toBeInTheDocument();
    expect(screen.getByText(projects[1].activeLine)).toBeInTheDocument();
  });

  it("updates runway metadata when a project receives a pointer enter", () => {
    const { container } = render(<ProjectRunway projects={projects} />);
    fireEvent.pointerEnter(screen.getByRole("link", { name: "Butlerlee 프로젝트 보기" }));
    const meta = container.querySelector(".project-runway-meta");
    expect(meta).toHaveTextContent("02 / 06");
    expect(meta).toHaveTextContent("Butlerlee");
    expect(meta).toHaveTextContent(projects[1].activeLine);
  });
});
